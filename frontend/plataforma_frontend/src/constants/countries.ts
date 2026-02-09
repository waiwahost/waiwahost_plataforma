export interface Country {
    name: string;
    dial_code: string;
    code: string;
    flag: string;
}

export const COUNTRIES: Country[] = [
    { name: "Colombia", dial_code: "+57", code: "CO", flag: "🇨🇴" },
    { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
    { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
    { name: "Mexico", dial_code: "+52", code: "MX", flag: "🇲🇽" },
    { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
    { name: "Argentina", dial_code: "+54", code: "AR", flag: "🇦🇷" },
    { name: "Chile", dial_code: "+56", code: "CL", flag: "🇨🇱" },
    { name: "Peru", dial_code: "+51", code: "PE", flag: "🇵🇪" },
    { name: "Ecuador", dial_code: "+593", code: "EC", flag: "🇪🇨" },
    { name: "Venezuela", dial_code: "+58", code: "VE", flag: "🇻🇪" },
    { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
    { name: "Panama", dial_code: "+507", code: "PA", flag: "🇵🇦" },
    { name: "Costa Rica", dial_code: "+506", code: "CR", flag: "🇨🇷" },
    { name: "Dominican Republic", dial_code: "+1", code: "DO", flag: "🇩🇴" },
    { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
    { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
    { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
    { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
];
