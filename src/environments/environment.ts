/**
 * Configuração de produção.
 * As chaves do Firebase para Web são públicas por natureza; o controle de acesso
 * deve ser feito pelas regras de segurança do Firestore.
 */
export const environment = {
  production: true,
  firebase: {
    projectId: 'ferias-garbo',
    appId: '1:1031639896422:web:ec6d44b2bb594134f138a7',
    storageBucket: 'ferias-garbo.appspot.com',
    apiKey: 'AIzaSyCDSvCrKuVdO-VkSy5biZK0nuYTee-GD00',
    authDomain: 'ferias-garbo.firebaseapp.com',
    messagingSenderId: '1031639896422',
    measurementId: 'G-SMBQ5CPQDT',
  },
};
