import { stringMd5 } from 'react-native-quick-md5';

export default function md5(text: string, bit: number): string {
  const fullHash = stringMd5(text); // 32-bit (full) hash

  if (bit === 16) {
    return fullHash.substring(8, 24); // return 16-bit hash (substring from index 8 to 24)
  }

  return fullHash; // return full 32-bit hash
}
