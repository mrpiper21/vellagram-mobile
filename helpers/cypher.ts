const Upper = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const Lower = ["a", "b", "c", "d", "e", "f", "g", "h", 'i', "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];


export function EncryptText(text: string, key: number): string{
    let encryptedText = "";
    for(let i = 0; i < text.length; i++){
        if(Upper.indexOf(text[i]) >= 0){
            const indexOfChar = Upper.indexOf(text[i])
            const limiter = indexOfChar + key % 26;
            encryptedText += Upper[limiter]

        } else if(Lower.indexOf(text[i]) >= 0){
            const indexOfChar = Lower.indexOf(text[i])
            const limiter = indexOfChar + key % 26
            encryptedText += Lower[limiter];
        } else {
            encryptedText += text[i];
        }
    }

    return encryptedText;
}

export function DecryptText(text: string, key: number): string {
    let decryptedText = "";
    for (let i = 0; i < text.length; i++) {
        if (Upper.indexOf(text[i]) >= 0) {
            const indexOfChar = Upper.indexOf(text[i]);
            let limiter = (indexOfChar - key) % 26;
            if (limiter < 0) limiter += 26;
            decryptedText += Upper[limiter];
        } else if (Lower.indexOf(text[i]) >= 0) {
            const indexOfChar = Lower.indexOf(text[i]);
            let limiter = (indexOfChar - key) % 26;
            if (limiter < 0) limiter += 26;
            decryptedText += Lower[limiter];
        } else {
            decryptedText += text[i];
        }
    }
    return decryptedText;
}