import { radioRecordStationsStr } from "./radioRecordStations";

enum Languages {
    ES = "es",
    US = "us",
    RU = "ru",
}

export const radioUrls = [
    { url: "https://27903.live.streamtheworld.com/CADENADIAL.mp3", name: "Dia", language: Languages.ES },
    { url: "https://stream-151.zeno.fm/129gp05ccchvv", name: "100", language: Languages.ES },
    { url: "https://npr-ice.streamguys1.com/live.mp3", name: "NPR", language: Languages.US },
    { url: "https://radiorecord.hostingradio.ru/rr_main96.aacp", name: "Record", language: Languages.RU },
    { url: "https://dfm.hostingradio.ru/dfm96.aacp", name: "Dfm", language: Languages.RU },
    { url: "https://hitfm.hostingradio.ru/hitfm96.aacp", name: "Hit fm", language: Languages.RU },
    { url: "https://maximum.hostingradio.ru/maximum96.aacp", name: "Maximum", language: Languages.RU },
    { url: "https://stream2.n340.com/12_love_64_reg_44?type=aac&UID=AD14C80B4F2B5F07A587AAA355BE7A60", name: "Love сессионный", language: Languages.RU },
    { url: "https://pub0201.101.ru/stream/air/aac/64/219?624e", name: "Like fm", language: Languages.RU },
    { url: "https://europaplus.hostingradio.ru:8014/europaplus320.mp3?a8fc0b8a", name: "Европа плюс", language: Languages.RU },
    { url: "https://pub0201.101.ru/stream/air/aac/64/99?0df4", name: "Energy", language: Languages.RU },
];
//  { url: "", name: "", language: Languages. },





function parseM3U(m3uString: string) {
    const lines = m3uString
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("#EXTINF")) {
            const name = line.split(",").slice(1).join(",").trim();
            const url = lines[i + 1];

            if (url && !url.startsWith("#")) {
                result.push({ name, url });
            }
        }
    }

    return result;
}

radioUrls.push(...parseM3U(radioRecordStationsStr).map(({ name, url }) => ({ name, url, language: Languages.RU })));
