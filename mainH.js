let hashedValue1;//첫 번째 해시값 변수 선언
let hashedValue2;//첫 번째 해시값 변수 선언

document.getElementById("hashed1").addEventListener("submit", async (e) => {
    e.preventDefault(); // form 기본 동작 막기
    hashedValue1 = document.getElementById("hashedInput1").value.trim(); //사용자의 입력 값 저장(trim()은 공백을 무시하는 코드)
});

document.getElementById("hashed2").addEventListener("submit", async (e) => {
    e.preventDefault(); // form 기본 동작 막기
    hashedValue2 = document.getElementById("hashedInput2").value; //사용자의 입력 값 저장(trim()은 공백을 무시하는 코드)
    if(!hashedValue1 || !hashedValue2){//!변수 : 값이 없거나 비어 있으면 true
        alert("해시 값이 비어 있습니다")
        return;
    }
    if(hashedValue1 == hashedValue2){
    alert("파일 변조 안 되었음");
    }
    else{
        alert("파일 변조 의심됨(해시값 다시 확인 필요)");
    }
});
