async function encryptFile(fileBuffer, key) {
  // IV는 무작위 12바이트 생성
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,          // 미리 생성된 키
    fileBuffer    // 파일 데이터
  );

  // IV + 암호문 형태로 합침
  const combined = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.byteLength);

  return combined;
}

//자동 다운로드
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

// 파일 입력 요소 가져오기
//document.getElementById('fileuploadE');

// 파일 선택 시 이벤트 처리
document.getElementById('fileuploadE').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("선택한 파일:", file.name);

    // 파일을 arrayBuffer로 읽기
    const fileData = await file.arrayBuffer();

    // 암호 수행
    const encrypted = await encryptFile(fileData, key);

    // 다운로드
    downloadEncryptedFile(encrypted, file.name + ".enc");
});