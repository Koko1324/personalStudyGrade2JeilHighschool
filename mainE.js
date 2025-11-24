// 전역 키 저장 변수
let cryptoKey = null;

//16 바이트 랜덤 문자열 생성 << indexE
function generateKeyBase64() {
    const raw = crypto.getRandomValues(new Uint8Array(16)); // AES-128
    const b64 = btoa(String.fromCharCode(...raw));
    return b64;
}

//랜덤 문자열 확인 << indexE
console.log(generateKeyBase64());

//랜덤 문자열 web crypto api의 키로 전환 << indexE에서 문자열 제출 했을 때 작동시키기. 
async function importKeyFromBase64(b64) { //async를 씀으로써 계속 적용됨?
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        "raw",
        raw,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

document.getElementById("key").addEventListener("submit", async (e) => {
    e.preventDefault(); // form 기본 동작 막기

    const b64 = document.getElementById("keyInput").value; //사용자 입력 값이 b64
    
    //함수 처리과정에서 오류가 없도록 try와 catch사용
    try {
        cryptoKey = await importKeyFromBase64(b64); //await로 async를 사용? 하여 b64를 실제 사용 가능한 key로 바꿈.
        console.log("CryptoKey 생성 성공:", cryptoKey);
        alert("키가 성공적으로 로드되었습니다.");
    } catch (err) {
        console.error(err);
        alert("키 형식이 올바르지 않습니다.");
    }
});

// 파일 암호화 함수
async function encryptFile(fileBuffer, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        fileBuffer
    );

    const combined = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.byteLength);

    return combined;
}

// 다운로드 함수
function downloadEncryptedFile(data, filename) {
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    a.remove();
}

// 파일 선택 처리
document.getElementById('fileuploadE').addEventListener('change', async (event) => {
    if (!cryptoKey) { 
        alert("먼저 키를 입력하세요.");
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    console.log("선택한 파일:", file.name);

    const fileData = await file.arrayBuffer();
    const encrypted = await encryptFile(fileData, cryptoKey);

    downloadEncryptedFile(encrypted, file.name + ".enc");
});