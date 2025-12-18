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
        const key = await importKeyFromBase64(b64); //await로 async를 사용? 하여 b64를 실제 사용 가능한 key로 바꿈.
        console.log("CryptoKey 생성 성공:", key);
        alert("키가 성공적으로 로드되었습니다.");
    } catch (err) {
        console.error(err);
        alert("키 형식이 올바르지 않습니다.");
    }
});