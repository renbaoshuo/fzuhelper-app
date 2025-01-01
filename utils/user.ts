import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { getApiV1LoginAccessToken } from '@/api/generate';
import md5 from '@/utils/md5';

import {
  AUTO_CHATAPA_VERIFY_URL,
  LOGIN_URL,
  SSO_LOGIN_URL,
  VERIFY_CODE_URL,
} from '@/constants/login';

interface ILoginRes {
  id: string;
  cookies: string[];
}

async function doLogin(data: {
  id: string;
  password: string;
}): Promise<ILoginRes> {
  const instance = axios.create({
    withCredentials: true,
  });

  console.log('start login');

  const captchaImg = await instance
    .get(VERIFY_CODE_URL, {
      responseType: 'arraybuffer',
    })
    .then(
      response =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsArrayBuffer(response.data);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        }),
    )
    .catch(e => console.log(e.stack));

  console.log('captchaImg', captchaImg);

  // TODO: manual captcha code input if service is down
  const captchaCode = instance
    .post(AUTO_CHATAPA_VERIFY_URL, {
      validateCode: captchaImg,
    })
    .then(res => res.data.message);

  console.log('captchaCode', captchaCode);

  const loginRes = await instance
    .post(
      LOGIN_URL,
      {
        Verifycode: captchaCode,
        muser: data.id,
        passwd: md5(data.password, 16),
      },
      {
        maxRedirects: 0,
        headers: {
          Referer: 'https://jwch.fzu.edu.cn',
          Origin: 'https://jwch.fzu.edu.cn',
        },
      },
    )
    .then(() => {
      throw new Error('login failed');
    })
    .catch(err => {
      if (err.response?.status === 302) {
        const redirectUrl = err.response.headers.location;

        const token = redirectUrl.match(/token=([\w-]+)/)?.[1] || '';
        const id = redirectUrl.match(/id=(\d+)/)?.[1] || '';
        const num = redirectUrl.match(/num=(\d+)/)?.[1] || '';

        if (!token || !id || !num) {
          throw new Error('login failed');
        }

        return {
          id,
          token,
          num,
        };
      }
    });

  if (!loginRes) {
    throw new Error('login failed');
  }

  const ssoLoginRes = await instance
    .post(
      SSO_LOGIN_URL,
      {
        token: loginRes.token,
      },
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        responseType: 'json',
      },
    )
    .then(res => res.data);

  console.log('ssol', ssoLoginRes);

  // if (loginResp.code )

  throw new Error('login failed');
}

export async function userLogin(data: { id: string; password: string }) {
  try {
    const res = await doLogin(data);
    const { id, cookies } = res;
    await AsyncStorage.setItem('id', id);
    await AsyncStorage.setItem('cookies', cookies[0]);
    try {
      await getApiV1LoginAccessToken();
      return Promise.resolve();
    } catch (e) {
      // TODO 提示token获取失败
      return Promise.reject();
    }
  } catch (e) {
    // TODO 提示登录失败
    return Promise.reject();
  }
}
