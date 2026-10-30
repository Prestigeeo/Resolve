import re
from typing import Tuple, List, Dict, Any, Optional
from .emergency_directory import lookup_bank_emergency, NIGERIAN_BANKS_EMERGENCY_DATA

class SecurityGuardrail:
    # Explicit patterns: Must be preceded by sensitive context words to prevent redacting ticket references
    CARD_PAN_PATTERN = re.compile(r'\b(?:\d{4}[ -]?){3}\d{4}\b')
    BVN_NIN_PATTERN = re.compile(r'\b(?:bvn|nin)(?:\s+is\s+|\s*[:=-]\s*|\s+)?(\d{11})\b', re.IGNORECASE)
    OTP_PATTERN = re.compile(r'\b(?:otp|one[- ]time[- ]password|verification code)(?:\s+is\s+|\s*[:=-]\s*|\s+)(\d{6})\b', re.IGNORECASE)
    PIN_PATTERN = re.compile(r'\b(?:atm[- ]pin|card[- ]pin|pin|secret pin)(?:\s+is\s+|\s*[:=-]\s*|\s+)(\d{4})\b', re.IGNORECASE)
    CVV_PATTERN = re.compile(r'\b(?:cvv|cvc)(?:\s+is\s+|\s*[:=-]\s*|\s+)(\d{3})\b', re.IGNORECASE)

    URGENT_FRAUD_KEYWORDS = [
        "stole my phone",
        "stolen phone",
        "phone was snatched",
        "emptying my account",
        "draining my account",
        "gave them my otp",
        "entered my pin",
        "unauthorized debit right now",
        "just debited me without",
        "they are withdrawing my money",
        "hacked my account",
        "blocked my sim"
    ]

    @classmethod
    def sanitize_input(cls, raw_text: str) -> Tuple[str, List[str]]:
        sanitized = raw_text
        redacted = []

        if cls.CARD_PAN_PATTERN.search(sanitized):
            sanitized = cls.CARD_PAN_PATTERN.sub("[REDACTED_CARD_NUMBER]", sanitized)
            redacted.append("CARD_PAN")

        if cls.BVN_NIN_PATTERN.search(sanitized):
            sanitized = cls.BVN_NIN_PATTERN.sub("[REDACTED_BVN_OR_NIN]", sanitized)
            redacted.append("BVN_NIN")
        # Do not redact every standalone 11-digit number: Nigerian mobile
        # numbers have that shape and are required for airtime/data disputes.
        # BVN/NIN values are redacted only when their context is explicit.

        if cls.OTP_PATTERN.search(sanitized):
            sanitized = cls.OTP_PATTERN.sub("[REDACTED_OTP]", sanitized)
            redacted.append("OTP")

        if cls.PIN_PATTERN.search(sanitized):
            sanitized = cls.PIN_PATTERN.sub("[REDACTED_PIN]", sanitized)
            redacted.append("PIN")

        if cls.CVV_PATTERN.search(sanitized):
            sanitized = cls.CVV_PATTERN.sub("[REDACTED_CVV]", sanitized)
            redacted.append("CVV")

        return sanitized, redacted

    @classmethod
    def check_urgent_fraud_emergency(cls, text: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        text_lower = text.lower()
        is_urgent = any(kw in text_lower for kw in cls.URGENT_FRAUD_KEYWORDS)

        if not is_urgent:
            return False, None

        emergency_info = None
        for bank_key in NIGERIAN_BANKS_EMERGENCY_DATA:
            if bank_key.lower() in text_lower or NIGERIAN_BANKS_EMERGENCY_DATA[bank_key]["name"].lower() in text_lower:
                emergency_info = NIGERIAN_BANKS_EMERGENCY_DATA[bank_key]
                break

        return True, emergency_info
