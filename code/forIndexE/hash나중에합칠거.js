async function generateSHA256(buffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);//buffer(파일의 원본 binary 데이터)를 입력으로 넣으면 해시 결과가 담긴 ArrayBuffer를 반환
    const hashArray = Array.from(new Uint8Array(hashBuffer));//hashBuffer를 1바이트 단위로 읽을 수 있는 TypedArray(Uint8Array) 형태로 변환, Array.form : 표준 배열로 변환(.map사용 가능하도록)
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");//각 바이트를 2자리 16진수 문자열로 변환하는 과정.
}
const hash = await generateSHA256(fileData);//파일 데이터 해시
downloadString(hash, file.name + ".sha256");//해시값 다운로드(무결성 검사를 위해서)