// 전역 키 저장 변수
let cryptoKey = null;

//랜덤 문자열 web crypto api의 키로 전환 << indexD에서 문자열 제출 했을 때 작동시키기. 
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

// 파일 복호화 함수
async function decryptFile(encryptedBuffer, key) {
    // AES-GCM은 12바이트 IV 사용 중
    const ivLength = 12;

    // 전체 데이터에서 IV와 암호문 분리
    const iv = encryptedBuffer.slice(0, ivLength);
    const ciphertext = encryptedBuffer.slice(ivLength);

    // 복호화 실행
    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new Uint8Array(iv)
        },
        key,
        ciphertext
    );

    return new Uint8Array(decryptedBuffer);
}

function downloadDecryptedFile(data, filename) {
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // 원본 이름을 그대로 사용하도록 지정
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    a.remove();
}

document.getElementById('fileuploadD').addEventListener('change', async (event) => {
    if (!cryptoKey) {
        alert("먼저 키를 입력하세요.");
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    console.log("복호화할 파일:", file.name);

    const encryptedData = await file.arrayBuffer();
    const decrypted = await decryptFile(new Uint8Array(encryptedData), cryptoKey);

    // ".enc" 제거하기 (옵션)
    const originalName = file.name.replace(/\.enc$/, "");

    downloadDecryptedFile(decrypted, originalName);
});
