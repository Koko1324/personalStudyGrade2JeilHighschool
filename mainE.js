// 전역 키 저장 변수
let cryptoKey = null;

//16 바이트 랜덤 문자열 생성 << indexE
function generateKeyBase64() {
    const raw = crypto.getRandomValues(new Uint8Array(16)); // AES-128
    const b64 = btoa(String.fromCharCode(...raw));
    return b64;
}

//랜덤 문자열 확인 << indexE
let randomValue = generateKeyBase64();       // 1회만 생성
console.log(randomValue);                    // 같은 값 출력
//document.getElementById("string").innerHTML = randomValue; //id가 string인 테그에 출력

// 다운로드 함수
function downloadString(data, filename) {
    const blob = new Blob([data]);//생성된 문자열을 blob로 래핑(효율적인 파일 처리 위함).
    const url = URL.createObjectURL(blob);//blob를 웹에서 다운로드 가능한 링크로 바꾸기.

    //자동 파일 다운로드 수행.
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    a.remove();
}
document.querySelector('#likeKey input[type="button"]').addEventListener("click", async (e) => {//버튼 클릭 했을 때 실행할 함수.
    e.preventDefault(); // form 기본 동작 막기

    //함수 처리과정에서 오류가 없도록 try와 catch사용
    try {
        downloadEncryptedFile(randomValue, "Key.txt"); //파일을 암호화하고 .txt확장자로 다운로드.
        alert("문자열(키)가 성공적으로 다운로드되었습니다.");
    } catch (err) {
        console.error(err);
        alert("다운로드 실패하였습니다.");
    }
});


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

// 파일 암호화 함수
async function encryptFile(fileBuffer, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); //난수 생성기로 12바이트 논스 생성하기.

    const encryptedBuffer = await crypto.subtle.encrypt( //encrypt()로 파일 데이터 암호화.
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        fileBuffer
    );

    //논스와 암호문+인증태그를 같이 저장한다.(복호화를 하기 위해).
    const combined = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.byteLength);

    new Uint8Array(fileBuffer).fill(0);//보안적인 보완을 위해 메모리에 남은 평문 제거.

    return combined; //최종 암호화된 데이터 반환.
}

// 다운로드 함수
function downloadEncryptedFile(data, filename) {
    const blob = new Blob([data]);//암호화된 데이터를 blob로 래핑(효율적인 파일 처리 위함).
    const url = URL.createObjectURL(blob);//blob를 웹에서 다운로드 가능한 링크로 바꾸기.

    //자동 파일 다운로드 수행.
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    a.remove();
}

// 파일 선택 처리
document.getElementById('fileuploadE').addEventListener('change', async (event) => { //시용자가 암호화될 파일을 선택 할 시 {}안의 코드를 실행함.
    
    //키 있는지 확인.
    if (!cryptoKey) { 
        alert("먼저 키를 입력하세요.");
        return;
    }

    //선택된 단일 파일만 처리.
    const file = event.target.files[0];
    if (!file) return;

    console.log("선택한 파일:", file.name);

    const fileData = await file.arrayBuffer();//전체 파일 메모리에 로드.(파일을 바이너리 배열로 읽음).
    const encrypted = await encryptFile(fileData, cryptoKey);

    downloadEncryptedFile(encrypted, file.name + ".enc"); //파일을 암호화하고 .enc확장자로 다운로드.
});