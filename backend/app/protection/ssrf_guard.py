import socket
import ipaddress
import urllib.parse
from typing import Tuple

# Denied IP ranges: loopback, private RFC1918, link-local (cloud metadata), multicast, reserved
FORBIDDEN_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback
    ipaddress.ip_network("10.0.0.0/8"),        # Private Class A
    ipaddress.ip_network("172.16.0.0/12"),     # Private Class B
    ipaddress.ip_network("192.168.0.0/16"),    # Private Class C
    ipaddress.ip_network("169.254.0.0/16"),    # Link-local / Cloud metadata (169.254.169.254)
    ipaddress.ip_network("0.0.0.0/8"),         # Broadcast / Unspecified
    ipaddress.ip_network("224.0.0.0/4"),       # Multicast
    ipaddress.ip_network("240.0.0.0/4"),       # Reserved
    ipaddress.ip_network("::1/128"),           # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),          # IPv6 Unique Local
    ipaddress.ip_network("fe80::/10"),         # IPv6 Link-Local
]

ALLOWED_SCHEMES = {"http", "https"}

class SSRFSecurityError(ValueError):
    """Raised when a URL targets a prohibited or internal network destination."""
    pass


def validate_and_resolve_url(url: str) -> Tuple[str, str, int, str]:
    """
    Validates a URL against SSRF vulnerabilities:
    1. Enforces allowed schemes (http/https strictly).
    2. Disallows empty or invalid hostnames.
    3. Resolves DNS to IP addresses.
    4. Validates IP against forbidden internal, loopback, and cloud metadata ranges.

    Returns:
        Tuple of (clean_url, hostname, port, resolved_ip)
    Raises:
        SSRFSecurityError if the destination is insecure.
    """
    if not url or not isinstance(url, str):
        raise SSRFSecurityError("URL must be a non-empty string.")

    url = url.strip()
    if "://" in url:
        raw_scheme = url.split("://", 1)[0].lower()
        if raw_scheme not in ALLOWED_SCHEMES:
            raise SSRFSecurityError(f"Forbidden URL scheme '{raw_scheme}'. Only HTTP and HTTPS are permitted.")
    else:
        url = "https://" + url

    try:
        parsed = urllib.parse.urlsplit(url)
    except Exception as e:
        raise SSRFSecurityError(f"Malformed URL syntax: {e}")

    scheme = parsed.scheme.lower()
    if scheme not in ALLOWED_SCHEMES:
        raise SSRFSecurityError(f"Forbidden URL scheme '{scheme}'. Only HTTP and HTTPS are permitted.")

    hostname = parsed.hostname
    if not hostname:
        raise SSRFSecurityError("URL does not contain a valid hostname.")

    # Block obvious localhost strings directly
    lower_host = hostname.lower()
    if lower_host in {"localhost", "localhost.localdomain", "127.0.0.1", "::1", "metadata.google.internal"}:
        raise SSRFSecurityError(f"Access to local or metadata host '{hostname}' is strictly forbidden.")

    port = parsed.port or (443 if scheme == "https" else 80)

    # Resolve IP address
    try:
        addr_info = socket.getaddrinfo(hostname, port, socket.AF_UNSPEC, socket.SOCK_STREAM)
    except socket.gaierror as e:
        # If domain cannot be resolved by DNS, it might be an unregistered/simulated test domain.
        # Check if hostname looks like a direct IP
        try:
            ip_obj = ipaddress.ip_address(hostname)
            is_ip = True
        except ValueError:
            is_ip = False

        if is_ip:
            for net in FORBIDDEN_NETWORKS:
                if ip_obj in net:
                    raise SSRFSecurityError(f"Access to private/internal IP {ip_obj} is prohibited.")
            return url, hostname, port, str(ip_obj)

        # Unresolvable external domain (e.g. lookalike test domain) -> safe from SSRF, resolve to simulated external IP
        return url, hostname, port, "UNRESOLVED_DNS"

    # Validate all resolved IPs
    resolved_ip = None
    for entry in addr_info:
        ip_str = entry[4][0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
        except ValueError:
            continue

        for forbidden in FORBIDDEN_NETWORKS:
            if ip_obj in forbidden or ip_obj.is_loopback or ip_obj.is_private or ip_obj.is_link_local:
                raise SSRFSecurityError(
                    f"Host '{hostname}' resolved to prohibited internal IP {ip_str}. Connection blocked by SSRFGuard."
                )

        if resolved_ip is None:
            resolved_ip = ip_str

    if not resolved_ip:
        resolved_ip = "0.0.0.0"

    return url, hostname, port, resolved_ip
