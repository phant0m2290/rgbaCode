import { encode, decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";
import { existsSync } from "https://deno.land/std@0.210.0/fs/exists.ts";

interface Decoded {
    type: "string" | "file";
    filename?: string;
    value: string;
}

const args = Deno.args;

if (args[0] == "decode") {
    if (!args[1].endsWith(".png")) {
        console.log("Invalid file name. Must be a png");
        Deno.exit(1);
    }
    const file = await Deno.readFile(args[1]);
    const value = decode(file).image;
    let chars: string[] = [];
    for (const char of value) if (char > 0) chars.push(String.fromCharCode(char));
    const obj: Decoded = JSON.parse(chars.join(""));
    
    if (obj.type == "file") {
        const filename = prompt("What would you like to call the file?", obj.filename as string) || obj.filename as string;
        Deno.writeTextFileSync(filename, obj.value);
    } else console.log(obj.value);

} else if (args[0] == "encode" || args[0] == "encodeStr") {
    let val: Decoded
    let filename: string;
    if (args[0] == "encodeStr" || !existsSync(args[1])) {
        console.log(`Could not find a file called '${args[1]}'. Encoding as string`)
        val = {type: "string", value: args[1]};
        filename = "output.png"
    } else {
        console.log(`Encoding file '${args[1]}'`);
        val = {type: "file", filename: args[1], value: Deno.readTextFileSync(args[1])};
        filename = args[1] + ".png";
    }
    let colours: number[] = [];
    for (const char of JSON.stringify(val)) colours.push(char.charCodeAt(0));
    const sqrt = Math.ceil(Math.sqrt(Math.ceil(colours.length / 4)));
    while (colours.length / 4 < sqrt * sqrt) colours.push(0);
    const data = new Uint8Array(colours);
    const png = encode(data, sqrt, sqrt);
    await Deno.writeFile(filename, png);
} else {
    console.log(`
    Usage:
        encode [Filename | String] ---- Encode a file or string
        encodeStr [String] ------------ Encode a string
        decode [file] ----------------- Decode an encoded image
    `);
}