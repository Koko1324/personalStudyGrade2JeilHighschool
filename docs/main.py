#암호화가 잘 되었는지 확인하기 위한 보조수단으로 암호화된 파일 바이너리의 0과 1의 갯수를 셀 것이다.

i = input("파일명(확장자까지)입력하세요")#암호화된 파일 경로 입력 받기
i = str(i)#파일 경로를 바이너리 읽는 함수에 쓰기 위해 문자열로 바꾸기
with open(i, "rb") as f:
    data = f.read()
print(data)#test

binaryOne = 0
binaryZero = 0
#바이너리 구조룰 확인함. 이제 이걸 분석하기.

for byte in data:
    #print(byte)#바이트로 추출함을 확인
    eightBit = bin(byte)#바이트를 8개의 비트로 나눔
    One = eightBit.count("1")#나눠진 비트 덩어리에서 1의 갯수를 binaryOne에 저장
    binaryOne = binaryOne + One
    Zero = eightBit.count("0")#나눠진 비트 덩어리에서 0의 갯수를 binaryZero에 저장
    binaryZero = binaryZero + Zero

print("1의 갯수:", binaryOne)
print("0의 갯수:", binaryZero)

#비율로 계산하기
bitCount = binaryOne + binaryZero
print("1의 비율", binaryOne/bitCount)
print("0의 비율", binaryZero/bitCount)