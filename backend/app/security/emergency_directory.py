"""
Verified Emergency USSD Kill-Switches and Fraud Desk Hotlines for Nigerian Financial Institutions.
Allows users facing active theft, phone loss, or unauthorized access to instantly lock accounts.
"""

from typing import Dict, Any, Optional

NIGERIAN_BANKS_EMERGENCY_DATA: Dict[str, Dict[str, Any]] = {
    "GTBANK": {
        "name": "Guaranty Trust Bank (GTBank)",
        "ussd_freeze_code": "*737*51*10#",
        "fraud_desk_phone": "+234 1 448 0000 / 0700 4826 66328",
        "fraud_desk_email": "frauddesk@gtbank.com",
        "action_prompt": "Dial *737*51*10# immediately from ANY phone to lock your GTBank account."
    },
    "ACCESS": {
        "name": "Access Bank",
        "ussd_freeze_code": "*901*911#",
        "fraud_desk_phone": "+234 1 271 2005-7 / 0700 300 0000",
        "fraud_desk_email": "contactcenter@accessbankplc.com",
        "action_prompt": "Dial *901*911# from any phone and enter your registered phone number to freeze your account."
    },
    "ZENITH": {
        "name": "Zenith Bank",
        "ussd_freeze_code": "*966*911#",
        "fraud_desk_phone": "+234 1 278 7000 / 0700 936 4842265",
        "fraud_desk_email": "zenithdirect@zenithbank.com",
        "action_prompt": "Dial *966*911# immediately from any phone to restrict debit transactions."
    },
    "FIRSTBANK": {
        "name": "First Bank of Nigeria",
        "ussd_freeze_code": "*894*911#",
        "fraud_desk_phone": "+234 1 905 2326 / 0700 347 782666328",
        "fraud_desk_email": "firstcontact@firstbanknigeria.com",
        "action_prompt": "Dial *894*911# from any phone to block your debit card and USSD profile."
    },
    "UBA": {
        "name": "United Bank for Africa (UBA)",
        "ussd_freeze_code": "*919*9#",
        "fraud_desk_phone": "+234 1 280 8822 / 0700 225 5822",
        "fraud_desk_email": "cfc@ubagroup.com",
        "action_prompt": "Dial *919*9# from any phone to block all digital transactions instantly."
    },
    "STANBIC": {
        "name": "Stanbic IBTC Bank",
        "ussd_freeze_code": "*909# (Select Stop Debit)",
        "fraud_desk_phone": "+234 1 422 2222 / 0700 909 909",
        "fraud_desk_email": "customercarenigeria@stanbicibtc.com",
        "action_prompt": "Call 0700 909 909 or dial *909# to stop debits on your account."
    },
    "FIDELITY": {
        "name": "Fidelity Bank",
        "ussd_freeze_code": "*770*911#",
        "fraud_desk_phone": "+234 1 448 5252 / 0700 343 35489",
        "fraud_desk_email": "true.serve@fidelitybank.ng",
        "action_prompt": "Dial *770*911# from any phone to block your mobile banking and cards."
    },
    "FCMB": {
        "name": "First City Monument Bank (FCMB)",
        "ussd_freeze_code": "*329*0#",
        "fraud_desk_phone": "+234 1 279 8800 / 0700 329 0000",
        "fraud_desk_email": "frauddesk@fcmb.com",
        "action_prompt": "Dial *329*0# from any phone to instantly block your FCMB account."
    },
    "WEMA": {
        "name": "Wema Bank / ALAT",
        "ussd_freeze_code": "*945*911#",
        "fraud_desk_phone": "+234 1 277 8600 / 0700 225 52528",
        "fraud_desk_email": "purpleconnect@wemabank.com",
        "action_prompt": "Dial *945*911# from any phone to restrict account activities."
    },
    "OPAY": {
        "name": "OPay Digital Services",
        "ussd_freeze_code": "*955*1310#",
        "fraud_desk_phone": "+234 1 888 8329 / 0700 888 8328",
        "fraud_desk_email": "anti-fraud@opay-inc.com",
        "action_prompt": "Dial *955*1310# or call 0700 888 8328 immediately to freeze your OPay wallet."
    },
    "PALMPAY": {
        "name": "PalmPay",
        "ussd_freeze_code": "*861*0#",
        "fraud_desk_phone": "+234 1 888 6888 / 01 888 6888",
        "fraud_desk_email": "fraud_monitoring@palmpay.com",
        "action_prompt": "Dial *861*0# or contact PalmPay fraud desk to lock wallet and cards."
    },
    "MONIEPOINT": {
        "name": "Moniepoint MFB",
        "ussd_freeze_code": "*5573*911#",
        "fraud_desk_phone": "+234 1 888 9900",
        "fraud_desk_email": "support@moniepoint.com",
        "action_prompt": "Dial *5573*911# or call support to flag unauthorized activity."
    },
    "KUDA": {
        "name": "Kuda Bank",
        "ussd_freeze_code": "Call Hotline Immediately",
        "fraud_desk_phone": "+234 1 633 5832 / 0700 022 55832",
        "fraud_desk_email": "frauddesk@kudabank.com",
        "action_prompt": "Call 0700 022 55832 or use another device to log in and lock cards."
    }
}

def lookup_bank_emergency(bank_name_or_alias: Optional[str]) -> Optional[Dict[str, Any]]:
    """Find bank emergency details by name substring or alias."""
    if not bank_name_or_alias:
        return None
    query = bank_name_or_alias.upper().strip()
    for key, data in NIGERIAN_BANKS_EMERGENCY_DATA.items():
        if key in query or data["name"].upper() in query:
            return data
    return None
