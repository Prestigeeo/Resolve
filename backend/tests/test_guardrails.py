import pytest
from app.security.guardrails import SecurityGuardrail

def test_card_pan_redaction():
    text = "My debit card number is 5399 1234 5678 9012 and it was debited twice."
    sanitized, redacted = SecurityGuardrail.sanitize_input(text)
    assert "[REDACTED_CARD_NUMBER]" in sanitized
    assert "5399 1234 5678 9012" not in sanitized
    assert "CARD_PAN" in redacted

def test_bvn_redaction():
    text = "The bank asked for my BVN 22233344455 to trace the transfer."
    sanitized, redacted = SecurityGuardrail.sanitize_input(text)
    assert "[REDACTED_BVN_OR_NIN]" in sanitized
    assert "22233344455" not in sanitized
    assert "BVN_NIN" in redacted

def test_otp_and_pin_redaction():
    text = "A caller asked me to read the OTP: 849201 and my ATM PIN is 1234."
    sanitized, redacted = SecurityGuardrail.sanitize_input(text)
    assert "[REDACTED_OTP]" in sanitized
    assert "[REDACTED_PIN]" in sanitized
    assert "849201" not in sanitized

def test_urgent_fraud_emergency_detection():
    urgent_text = "Someone stole my phone and they are emptying my account right now on GTBank!"
    is_urgent, info = SecurityGuardrail.check_urgent_fraud_emergency(urgent_text)
    assert is_urgent is True
    assert info is not None
    assert "*737*51*10#" in info["ussd_freeze_code"]

def test_non_urgent_failed_transfer():
    normal_text = "I transferred 5000 naira to my friend yesterday but he hasn't received it."
    is_urgent, info = SecurityGuardrail.check_urgent_fraud_emergency(normal_text)
    assert is_urgent is False
    assert info is None
