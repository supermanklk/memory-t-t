import React, { useEffect, useState } from 'react';
import './index.css';
import { Input, Button } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPreHost } from '../../../utils/request';

const hostPre = getPreHost();
const Login = (props) => {
  const params = useParams();
  console.log('faith=============params', params);

  const location = useLocation();
  console.log('faith=============location', location);

  const { type } = location.state;
  const [pageType, setPageType] = useState(type);
  let navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      console.log('faith=============', window.location.href);
    }, 2000);
  }, []);

  const [userInfo, setUserInfo] = useState({
    tel: '',
    username: '',
  });

  const goForward = () => {
    navigate(-1);
  };

  const register = () => {
    const { tel, username } = userInfo;
    if (tel && username) {
      // 去注册,调注册接口
      fetch(hostPre + '/memory/registerUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `tel=${tel}&username=${username}`,
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (res) {
          if (res.errCode === 200) {
            // 注册成功,设置登录状态回到主页
            localStorage.setItem('info', JSON.stringify(res.results));
            setUserInfo({ tel: '', username: '' });
            navigate(-1);
          } else {
            // 报错提示
          }
        });
    }
  };

  return (
    <div className="login-container">
      <span className={'login-style'}>
        {pageType === 'login' ? 'Log In!' : 'Sign Up!'}{' '}
      </span>

      <span className={'hint'}>Tel</span>
      <Input
        size="small"
        className={'addSty-login addSty'}
        value={userInfo.tel}
        onChange={(e) => {
          if (e.target.value && e.target.value.length > 11) return;
          setUserInfo({ ...userInfo, tel: e.target.value });
        }}
      />

      {type === 'login'}
      {type === 'register' && (
        <>
          <span className={'hint'}>Username</span>
          <Input
            size="small"
            className={'addSty-login addSty'}
            value={userInfo.username}
            onChange={(e) => {
              if (e.target.value && e.target.value.length > 20) return;
              setUserInfo({ ...userInfo, username: e.target.value });
            }}
          />
        </>
      )}

      <div>
        <Button onClick={register} className={'login-button'}>
          {pageType === 'login' ? '登录' : '注册'}
        </Button>
        <Button
          onClick={goForward}
          style={{ marginLeft: 10 }}
          className={'login-button'}
        >
          取消
        </Button>
      </div>
    </div>
  );
};

export default Login;
