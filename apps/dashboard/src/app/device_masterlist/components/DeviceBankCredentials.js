"use client";

import { Field } from "./DeviceFormModal";

export const BANK_DEFAULT_CREDENTIALS = {
  "mswipe-atomx": {
    bank_mswipe_username: "9400100344",
    bank_mswipe_password: "555555",
    bank_mswipe_verify_client_code: "ATOMXLIVE",
    bank_mswipe_verify_user_id: "ATOMXLIVE@SOL",
    bank_mswipe_verify_password: "ATOMX~DsD@281119",
    bank_mswipe_upi_api: "sdk"
  },
  "mswipe-bms": {
    bank_mswipe_username: "9300066508",
    bank_mswipe_password: "555555",
    bank_mswipe_verify_client_code: "BMSLIVE",
    bank_mswipe_verify_user_id: "BMSLIVE@SOL",
    bank_mswipe_verify_password: "BMSLIVE~DsD@061219",
    bank_mswipe_upi_api: "sdk"
  },
  "utap-skypay-dxb": {
    bank_mswipe_username: "9000036987",
    bank_mswipe_password: "306090",
    bank_mswipe_verify_client_code: "ATOMXLIVE",
    bank_mswipe_verify_user_id: "ATOMXLIVE@SOL",
    bank_mswipe_verify_password: "ATOMX~DsD@281119",
    bank_mswipe_upi_api: "sdk"
  },
  "cashlez-bms-indonesia-demo": {
    bank_sunmipay_merchant_name: "The Dragon",
    bank_sunmipay_transaction_type: "SALE",
    bank_sunmipay_aggregator_id: "pecinta mi",
    bank_sunmipay_mobile_user_id: "test03",
    bank_sunmipay_cashlez_package_name: "com.cashlez.android.garuda.allinone"
  },
  "cashlez-bms-indonesia": {
    bank_sunmipay_merchant_name: "Bookmyshow ID",
    bank_sunmipay_transaction_type: "SALE",
    bank_sunmipay_aggregator_id: "BookmyshowID",
    bank_sunmipay_mobile_user_id: "bookmyshowID",
    bank_sunmipay_cashlez_package_name: "com.cashlez.android.garuda.allinone"
  },
  "worldline-atomx-axis": {
    bank_worldline_tid: "0447232U",
    bank_worldline_password: "12345678",
    bank_worldline_sim_username: "atomx",
    bank_worldline_sim_password: "U$er#09873",
    bank_worldline_bank_function_password: "3226",
    bank_worldline_customer_qr_action: "com.example.menusample.YOUR_ACTION_BQR",
    bank_worldline_customer_card_action: "cn.desert.newpos.payui.master.YOUR_ACTION"
  },
  "mosambee-atomx-sbi": {
    bank_mosambee_user_name: "5252871758",
    bank_mosambee_password: "5880",
    bank_mosambee_app_key: "cGjhE$@fdhj4675riesae",
    bank_mosambee_merchant_code: "HYLZYQJV6ZXZUO52J0K",
    bank_mosambee_merchant_key: "7DB342C21C56902D31DC166C7B33BBE760AAD7D796B6300A"
  },
  "ezetap-atomx-axis": {
    bank_ezetap_prod_app_key: "730077d9-de69-4961-85bb-6bfcfe3367c7",
    bank_ezetap_merchant_name: "ATOMX CORPORATION PRIVATE LIMITED",
    bank_ezetap_user_name: "7875676169"
  },
  "pinelabs-atomx-hdfc": {
    bank_pinelabs_application_id: "43dab288a5d64e40b6b6aba51aaead59",
    bank_pinelabs_user_id: "1234",
    bank_pinelabs_smart_action: "com.pinelabs.masterapp.SERVER",
    bank_pinelabs_smart_package: "com.pinelabs.masterapp"
  }
};

export const DEFAULT_DEVICE_TYPES = [
  ["wisepos+", "Wisepos+"],
  ["Famoco", "Famoco"],
  ["serialNFC", "GateX Turnstile Reader"],
  ["sunmipay", "Cashlez Sunmipay"],
  ["MF919", "Mosambee MF919"],
  ["DX8000", "Mosambee | DX8000"],
  ["ezetap", "Ezetap"],
  ["worldline", "Worldline"],
  ["airpay", "Airpay"],
  ["pinelabsPax", "PinelabsPax"],
  ["Sunmi", "Sunmi"],
  ["utapSunmi", "utapSunmi"],
  ["other", "Other"]
];

export const DEFAULT_MODEL_TYPES = [
  ["wisepos+", "Wisepos+"],
  ["Famoco", "Famoco"],
  ["gatex", "GateX Turnstile Reader"],
  ["sunmipay", "Cashlez Sunmipay"],
  ["MF919", "Mosambee MF919"],
  ["DX8000", "Mosambee | DX8000"],
  ["ezetap", "Ezetap"],
  ["worldline", "Worldline"],
  ["airpay", "Airpay"],
  ["pinelabsPax", "PinelabsPax"],
  ["Sunmi", "Sunmi"],
  ["utapSunmi", "utapSunmi"],
  ["other", "Other"]
];

export const DEFAULT_BANK_TYPES = [
  ["mswipe-atomx", "MSWIPE ATOMX"],
  ["mswipe-bms", "MSWIPE BMS"],
  ["utap-skypay-dxb", "UTAP SKYPAY DXB"],
  ["cashlez-bms-indonesia", "CASHLEZ BMS INDONESIA"],
  ["mosambee-atomx-sbi", "MOSAMBEE ATOMX SBI"],
  ["ezetap-atomx-axis", "EZETAP ATOMX AXIS"],
  ["worldline-atomx-axis", "WORLDLINE ATOMX AXIS"],
  ["pinelabs-atomx-hdfc", "PINELABS ATOMX HDFC"],
  ["airpay-atomx-axis", "AIRPAY ATOMX AXIS"],
  ["cashlez-bms-indonesia-demo", "CASHLEZ DEMO INDO"],
  ["none", "NONE"]
];

export function getDefaultBankData(bank) {
  return { ...(BANK_DEFAULT_CREDENTIALS[bank] ?? {}) };
}

export function sanitizeBankData(bank, bankData) {
  const fields = Object.keys(BANK_DEFAULT_CREDENTIALS[bank] ?? {});
  return Object.fromEntries(
    fields.map((key) => [
      key,
      String(bankData?.[key] ?? BANK_DEFAULT_CREDENTIALS[bank][key] ?? "").trim()
    ])
  );
}

function getFieldLabel(key) {
  return key.replace(/^bank_/, "").replaceAll("_", " ").toUpperCase();
}

export default function DeviceBankCredentials({ bank, bankData, onChange }) {
  const credentialKeys = Object.keys(BANK_DEFAULT_CREDENTIALS[bank] ?? {});
  if (credentialKeys.length === 0) return null;

  return (
    <>
      <div className="[grid-column:1/-1] mt-1 border-t border-(--line) pt-4">
        <div className="font-vcr text-[9px] tracking-[0.16em] text-(--orange)">
          BANK CREDENTIALS
        </div>
      </div>
      {credentialKeys.map((key) => (
        <Field
          key={key}
          label={getFieldLabel(key)}
          name={key}
          value={bankData?.[key] ?? ""}
          onChange={onChange}
          type={key.includes("password") ? "password" : "text"}
          placeholder="Not set"
        />
      ))}
    </>
  );
}
