import React, { useCallback, useEffect, useState } from 'react';
import bg from '@/asset/bg.jpeg';
import styles from './index.module.scss';
import { Input, Button, Modal } from 'antd';
import 'antd/dist/antd.css'; // 引入antd样式文件

const Index = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [canTrigger, setCanTrigger] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 获取验证码图片的URL
  const getCaptchaUrl = () => {
    return `http://democ.1cloud.net.cn:18080/captcha/create?_t=${new Date().valueOf()}`;
  };

  // 处理登录按钮点击事件
  const handleLogin = () => {
    console.log('faith=============', username, password, verifyCode);
    // 调用登录接口，并带上验证码
    // http://democ.1cloud.net.cn:18080/admin/login/doLogin?password=9dd4268bbb9d686ef15b1eeb841ccc13&username=zhxy&verifyCode=3420

    const apiUrl = `http://democ.1cloud.net.cn:18080/admin/login/doLogin?password=9dd4268bbb9d686ef15b1eeb841ccc13&username=zhxy&verifyCode=6546`;
    // 在这里执行登录请求，可以使用fetch、axios或其他库
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log('faith=============data', data);

        // 处理登录结果
      })
      .catch((error) => {
        // 处理错误
      });
  };

  // 更新验证码图片URL并设置防抖
  const updateChaUrl = useCallback(() => {
    if (canTrigger) {
      const url = getCaptchaUrl();
      setCaptchaUrl(url);
      setCanTrigger(false);
      setCountdown(30);
      const countdownTimer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      setTimeout(() => {
        clearInterval(countdownTimer);
        setCanTrigger(true);
      }, 30000);
    }
  }, [canTrigger]); // Use useCallback to memoize the function

  useEffect(() => {
    const url = getCaptchaUrl();
    setCaptchaUrl(url);
  }, []);

  // const updateChaUrl = () => {
  //   const url = getCaptchaUrl();
  //   setCaptchaUrl(url);
  // };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function throttle(func: any, delay: number) {
    let timer: any = null;
    let startTime = Date.now();

    return function () {
      let curTime = Date.now();
      let remaining = delay - (curTime - startTime);
      const context = this;
      const args = arguments;

      clearTimeout(timer);
      if (remaining <= 0) {
        func.apply(context, args);
        startTime = Date.now();
      } else {
        timer = setTimeout(func, remaining);
      }
    };
  }

  // 使用节流处理更新验证码图片URL
  const throttledUpdateChaUrl = throttle(updateChaUrl, 5000);

  // // 获取验证码图片并更新到state
  // const refreshCaptcha = () => {
  //   const url = getCaptchaUrl();
  //   setCaptchaUrl(url);
  // };

  const createIframe = (url) => {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    // 将 iframe 添加到指定的父容器中
    const iframeContainer = document.getElementById('iframeContainer');
    // 设置 iframeContainer 的样式
    iframeContainer.style.position = 'absolute';
    iframeContainer.style.width = '100vw';
    iframeContainer.style.height = '100vh';
    iframeContainer.style.background = 'black';

    iframeContainer.appendChild(iframe);
  };

  return (
    <div className={styles.main}>
      <div className={styles.globalCcnfig}>大设置</div>
      <div className={styles.right}>
        <div
          onClick={() => {
            createIframe('https://www.electronjs.org');
          }}
          className={styles.loginTitle}
        >
          登录
        </div>
        <div>
          <div>
            <div className={styles.loginItem}>
              <Input
                className={styles.input}
                placeholder="请输入账户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className={styles.loginItem}>
              <Input.Password
                className={styles.input}
                placeholder="请输入密码(6-16位字母加数字)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={styles.loginItemVer}>
              <Input
                className={styles.input}
                placeholder="请输入验证码"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
              />
              {countdown > 0 ? (
                <Button
                  className={styles.codeAgain}
                  size="small"
                  type="primary"
                >
                  验证码{countdown}
                </Button>
              ) : null}

              <img
                style={{ height: 40, width: 100 }}
                src={captchaUrl}
                alt="验证码"
                onClick={updateChaUrl}
              />
            </div>
            <Button
              className={styles.loginBtn}
              type="primary"
              onClick={handleLogin}
            >
              登录
            </Button>
            <div
              onClick={() => {
                setIsModalOpen(true);
              }}
              className={styles.configEnter}
            >{`>配置入口`}</div>
          </div>
        </div>
      </div>
      <Modal
        closeIcon={false}
        width={400}
        title="配置"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}
        cancelText={`取消`}
        okText={`保存`}
      >
        <Input
          className={styles.modalInput}
          placeholder="请输入服务地址"
        ></Input>
        <Input
          className={styles.modalInput}
          placeholder="请输入跳转地址"
        ></Input>
      </Modal>
    </div>
  );
};
export default Index;
