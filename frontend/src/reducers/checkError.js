import config from './../config';

const checkError = (action) => {
  const USER_API = `${config.SERVER_HOST}:${config.USER_PORT}/api`;
  // 일단 에러가 참일 경우
  if (action.error && action.payload) {
    const response = action.payload.response;

    // 네트워크 에러 (서버가 죽은 경우)
    if (!response) {
        alert("서버가 죽었습니다.");
        return;
    }

    // 서버 오류
    if (response.status >= 500) {
      alert("500 internal server error");
      return;
    }
  }
  return action;
}

export default checkError;
