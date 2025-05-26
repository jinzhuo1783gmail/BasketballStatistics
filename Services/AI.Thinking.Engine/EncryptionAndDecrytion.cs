using System.Security.Cryptography;
using System.Text;

namespace AI.Thinking.Engine
{
    public static class EncryptionAndDecrytion
    {
        public const string SecretKey = "3c523173cbd841b081fe9db88fc79b8d";
        public static string Encrypt(this string plainText)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(SecretKey);
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                ICryptoTransform encryptor = aes.CreateEncryptor();

                byte[] iv = aes.IV;
                byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
                byte[] encryptedBytes;

                using (var memoryStream = new MemoryStream())
                {
                    using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                    {
                        cryptoStream.Write(plainBytes, 0, plainBytes.Length);
                        cryptoStream.FlushFinalBlock();
                        encryptedBytes = memoryStream.ToArray();
                    }
                }

                byte[] combinedBytes = new byte[iv.Length + encryptedBytes.Length];
                Array.Copy(iv, 0, combinedBytes, 0, iv.Length);
                Array.Copy(encryptedBytes, 0, combinedBytes, iv.Length, encryptedBytes.Length);

                return Convert.ToBase64String(combinedBytes);
            }
        }

        public static string Decrypt(this string encryptedText)
        {
            byte[] combinedBytes = Convert.FromBase64String(encryptedText);

            using (var aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(SecretKey);
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                byte[] iv = new byte[aes.BlockSize / 8];
                byte[] encryptedBytes = new byte[combinedBytes.Length - iv.Length];

                Array.Copy(combinedBytes, 0, iv, 0, iv.Length);
                Array.Copy(combinedBytes, iv.Length, encryptedBytes, 0, encryptedBytes.Length);

                ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, iv);

                using (var memoryStream = new MemoryStream(encryptedBytes))
                using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                using (var streamReader = new StreamReader(cryptoStream))
                {
                    return streamReader.ReadToEnd();
                }
            }
        }
    }
}