from enum import Enum

class InteractionMode(str, Enum):
    FORM = "FORM"
    CHAT = "CHAT"

class InteractionType(str, Enum):
    IN_PERSON = "IN_PERSON"
    CALL = "CALL"
    EMAIL = "EMAIL"
    VIDEO = "VIDEO"

class InteractionStatus(str, Enum):
    COMPLETED = "COMPLETED"
    FOLLOW_UP_PENDING = "FOLLOW_UP_PENDING"
    CANCELLED = "CANCELLED"
