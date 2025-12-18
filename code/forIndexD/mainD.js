// 전역 키 저장 변수
let cryptoKey = null;

//랜덤 문자열 web crypto api의 키로 전환 << indexD에서 문자열 제출 했을 때 작동시키기. 
async function importKeyFromBase64(b64) { //async를 씀으로써 계속 적용됨(비동기 코드임).
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
        cryptoKey = await importKeyFromBase64(b64); //await로 async가 실행될때 까지 대기하여 b64를 실제 사용 가능한 key로 바꿈.
        console.log("CryptoKey 생성 성공:", cryptoKey);
        alert("키가 성공적으로 로드되었습니다.");
        document.getElementById("keyInput").value = "";//수정(메모리에서 보안적인 보완을 위해 키 만들때 쓴 문자열 제거)
    } catch (err) {
        console.error(err);
        alert("키 형식이 올바르지 않습니다.");
    }
});

// 파일 복호화 함수
async function decryptFile(encryptedBuffer, key) {
    // AES-GCM은 12바이트 IV(논스) 사용 중 이므로 복호화를 위해 같은 논스 값으로 결정한다.
    const ivLength = 12;

    // 전체 데이터에서 IV와 암호문 분리
    const iv = encryptedBuffer.slice(0, ivLength);
    const ciphertext = encryptedBuffer.slice(ivLength);

    // 복호화 실행, 인증 테그도 확인하여 무결성 검증이 가능하다.
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
//해시 함수 정의
async function generateSHA256(buffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);//buffer(파일의 원본 binary 데이터)를 입력으로 넣으면 해시 결과가 담긴 ArrayBuffer를 반환
    const hashArray = Array.from(new Uint8Array(hashBuffer));//hashBuffer를 1바이트 단위로 읽을 수 있는 TypedArray(Uint8Array) 형태로 변환, Array.form : 표준 배열로 변환(.map사용 가능하도록)
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");//각 바이트를 2자리 16진수 문자열로 변환하는 과정, .join은 모든 16진수를 하나의 긴 문자열로 이어붙임
}

// 다운로드 함수
function downloadString(data, filename) {
    const blob = new Blob([data]);//생성된 문자열을 blob로 래핑(효율적인 파일 처리 위함).
    const url = URL.createObjectURL(blob);//blob를 웹에서 다운로드 가능한 링크로 바꾸기.

    //자동 파일 다운로드 수행.
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // 원본 이름을 그대로 사용하도록 지정
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    a.remove();
}

document.getElementById('fileuploadD').addEventListener('change', async (event) => {//복호화될 파일을 선택할 시 {}의 코드가 실행됨.
    //키 입력 했는지 확인.
    if (!cryptoKey) {
        alert("먼저 키를 입력하세요.");
        return;
    }

    //선택된 단일 파일만 처리.
    const file = event.target.files[0];
    if (!file) return;

    console.log("복호화할 파일:", file.name);

    const encryptedData = await file.arrayBuffer();//암호화된 파일 메모리로 읽어오기.
    const decrypted = await decryptFile(new Uint8Array(encryptedData), cryptoKey);//복호화 수행하기.

    const hash = await generateSHA256(decrypted);//복호화된 파일 데이터 해시
    downloadString(hash, file.name + ".sha256");//해시값 다운로드(무결성 검사를 위해서)

    // ".enc" 제거하기 (옵션)
    const originalName = file.name.replace(/\.enc$/, ""); //파일을 복호화하고 .enc확장자를 빼고 다운로드.

    downloadString(decrypted, originalName);//복호화된 파일 다운로드.
});
