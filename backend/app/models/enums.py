import enum

class UserRole(str, enum.Enum):
    CREATOR = "CREATOR"
    REVIEWER = "REVIEWER"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

class ContentStatus(str, enum.Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    AI_REVIEW_COMPLETED = "AI Review Completed"
    CHANGES_REQUIRED = "Changes Required"
    RESUBMITTED = "Resubmitted"
    PENDING_REVIEWER_VERIFICATION = "Pending Reviewer Verification"
    VERIFIED = "Verified"
    PENDING_MANAGER_APPROVAL = "Pending Manager Approval"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class SeverityLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class FindingCategory(str, enum.Enum):
    BANNED_EXPRESSION = "Banned Expression"
    INCORRECT_TERMINOLOGY = "Incorrect Terminology"
    UNSUPPORTED_CLAIM = "Unsupported Claim"
    TONE_INCONSISTENCY = "Tone Inconsistency"
    MISLEADING_STATEMENT = "Misleading Statement"
    MISSING_DISCLAIMER = "Missing Disclaimer"
    INCORRECT_PRODUCT_INFO = "Incorrect Product Info"
    UNVERIFIED_SOURCE = "Unverified Source"

class SuggestionStatus(str, enum.Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    MANUALLY_EDITED = "Manually Edited"

class ApprovalAction(str, enum.Enum):
    APPROVED = "Approved"
    REJECTED = "Rejected"
    CHANGES_REQUESTED = "Changes Requested"
