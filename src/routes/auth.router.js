const { Router } = require('express');
const { checkAuth } = require('../middlewares/auth-cookie');
const jsend = require('../middlewares/jsend.js');
const { AccountModel } = require('../models/account.model');
const router = Router();

const regPass = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,64}$/;
const regPhoneNumber = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
const regEmail = /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const regBirthDate = /^\d{4}-\d{2}-\d{2}$/;

const verifyAccount = ({
  email,
  password,
  name,
  phoneNumber,
  birthDate,
  gender,
  type,
}) => {
  //핵심은 사용자 입력이 올바르게 입력했는지 확인하는 것.
  return (
    regPass.test(password) &&
    regPhoneNumber.test(phoneNumber) &&
    regEmail.test(email) &&
    typeof name === 'string' &&
    typeof gender === 'string' &&
    ['m', 'f'].includes(gender) &&
    typeof birthDate === 'string' &&
    regBirthDate.test(birthDate) &&
    typeof type === 'string' &&
    ['reader', 'author', 'admin'].includes(type)
  );
};

router.get('/', (req, res) => {
  res.status(200).send({ message: '통합 인증 로직' });
});

// 회원가입을 위한 요청 처리
router.post('/signup', async (req, res) => {
  try {
    if (!verifyAccount(req.body))
      throw new Error('Account information is not valid.');
    const account = new AccountModel(req.body);
    const stat = await account.save();

    if (!stat) {
      throw new Error('stat could not found');
    }
    return res.status(200).json(jsend.SUCCESS('Signup Request Completed'));
  } catch (err) {
    res.status(400).json(jsend.ERROR(err.toString()));
  }
});

router.get('/login', async (req, res) => {
  try {
    if (!regEmail.test(req.query.email) && regPass.test(req.query.password))
      return res
        .status(400)
        .json(jsend.ERROR('Information that does not comply with input rules'));
    const account = await AccountModel.findOne({ email: req.query.email });
    if (account) {
      await account
        .comparePassword(req.query.password)
        .then((isMatch) => {
          if (!isMatch) {
            return res.json(jsend.FAIL('Invalid ID or password'));
          }
          account
            .generateToken({
              email: account.email,
              type: account.type,
              id: account._id,
            })
            .then((account) => {
              res.cookie('token', account.token);
              return res
                .status(200)
                .json(
                  jsend.SUCCESS('Login Successful', { token: account.token })
                ); // userId: user._id
            })
            .catch((err) => {
              res.status(400).send(jsend.FAIL('Invalid ID or password'));
            });
        })
        .catch((err) => res.json(jsend.ERROR(err.message)));
    } else {
      return res.status(400).send(jsend.ERROR('No Such Account'));
    }
  } catch (err) {
    return res.status(500).json(jsend.ERROR(err.message));
  }
});

// 계정 정보 수정을 위한 요청 처리, replace로 document replace
router.put('/modify', async (req, res) => {
  try {
    const token = req.body.token;
    const accountID = await AccountModel.getIdByToken(token);
    const baseAccount = await AccountModel.findOne({ _id: accountID });

    if (baseAccount) {
      const status = await AccountModel.replaceOne(
        { _id: accountID },
        req.body
      );

      return res.status(200).send({ sucess: true, status });
    } else {
      res.status(400).send(jsend.ERROR('No Such account'));
    }
  } catch (err) {
    return res.status(500).json(jsend.ERROR(err.message));
  }
});

// # COOKIE TOKEN TESTING ROUTES

router.get('/reader', checkAuth('reader'), (req, res) => {
  res.status(200).json('good!!! ##!!');
});

router.get('/author', checkAuth('author'), (req, res) => {
  res.status(200).json('good!!! ##!!');
});

router.get('/admin', checkAuth('admin'), (req, res) => {
  res.status(200).json('good!!! ##!!');
});

module.exports = router;
