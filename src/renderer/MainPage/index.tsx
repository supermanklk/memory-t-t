import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.module.scss';
import { Input, Button, Modal, Popover, message, Radio, Select } from 'antd';
import 'antd/dist/antd.css'; // 引入antd样式文件
import { SettingTwoTone } from '@ant-design/icons';
import warning from '../../../assets/warning.png';
import { MD5 } from 'crypto-js';
import { createIframe, reloadIframe, removeIframe } from './util';
import { ipcRenderer } from 'electron';
const HOST = 'http://democ.1cloud.net.cn:18080';
const ADDRESS = '/web/visualization/index.html';

const { Option } = Select;

const Index = (props) => {
  const lockTimeOptions = [
    { value: '0', label: '永不' },
    { value: '1', label: '1分钟' },
    { value: '2', label: '2分钟' },
    { value: '5', label: '5分钟' },
    { value: '10', label: '10分钟' },
    { value: '20', label: '20分钟' },
    { value: '30', label: '30分钟' },
    { value: '60', label: '1小时' },
  ];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [serviceIp, setServiceIp] = useState(HOST);
  const [serviceAdd, setserviceAdd] = useState(ADDRESS);
  const [lock, setLock] = useState(false);

  const [verifyCode, setVerifyCode] = useState('');
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [canTrigger, setCanTrigger] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [islogin, setIslogin] = useState(false);
  const [logOffModal, setLogOffModal] = useState(false);
  const [logOffPass, setLogOffPass] = useState('');
  const [logOffPassErr, setlogOffPassErr] = useState('');

  // 服务配置State
  const [screenSize, setScreenSize] = useState('fullscreen');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [clsid, setClsid] = useState('');

  const [lockTime, setLockTime] = useState('0'); // 设置默认值为 '0'，即"永不"
  const [serviceModal, setServiceModal] = useState(false);

  // 获取验证码图片的URL
  const getCaptchaUrl = () => {
    return `${HOST}/captcha/create?_t=${new Date().valueOf()}`;
  };

  // 处理登录按钮点击事件
  const handleLogin = () => {
    // 调用登录接口，并带上验证码
    const hashedPass = MD5(password).toString();
    const apiUrl = `${HOST}/admin/login/doLogin?password=${hashedPass}&username=${username}&verifyCode=${verifyCode}`;

    // 在这里执行登录请求，可以使用fetch、axios或其他库
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data: any) => {
        const mockData = {
          msg: '/brview',
          object: {
            clsid: '1f9c23c377194ba9a939e36a30ee9f9a',
            roleName: '一般用户',
            userName: 'zhxy',
          },
          success: true,
        };
        if (mockData?.success === true) {
          setClsid(mockData?.object?.clsid);
          createIframe(
            `${serviceIp}${serviceAdd}?clsid=${mockData?.object?.clsid}#/login?redirect=/visualization`
          );
          setIslogin(true);
        }
      })
      .catch((error) => {
        message.warning(error);
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

  /**
   * local start
   */
  const handleServiceIp = (value: string) => {
    localStorage.setItem('desk-ip', value);
  };

  const getServiceIp = () => {
    return localStorage.getItem('desk-ip') || HOST;
  };

  const getServiceAdd = () => {
    return localStorage.getItem('desk-add') || '/web/visualization/index.html';
  };

  const handleServiceAdd = (value: string) => {
    localStorage.setItem('desk-add', value);
  };
  // local end

  const handleOk = () => {
    if (!serviceIp || !serviceAdd) {
      message.warning('信息缺失');
      return;
    }

    handleServiceIp(serviceIp);
    handleServiceAdd(serviceAdd);
    message.success('保存成功~');

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 初始化验证码图片
  useEffect(() => {
    const url = getCaptchaUrl();
    setCaptchaUrl(url);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      // 在这里执行鼠标移动事件的操作
      console.log('Mouse moved:');
    };

    ipcRenderer.on('mouseScrolled', handleMouseMove);

    return () => {
      ipcRenderer.removeListener('mouseScrolled', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!logOffModal) {
      setlogOffPassErr('');
      setLogOffPass('');
    }
  }, [logOffModal]);

  useEffect(() => {
    setServiceIp(getServiceIp());
    setserviceAdd(getServiceAdd());
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setServiceIp(getServiceIp());
      setserviceAdd(getServiceAdd());
    }
  }, [isModalOpen]);

  const openLogOffModal = () => {
    setLogOffModal(true);
  };

  const openServiceModal = () => {
    setServiceModal(true);
  };

  const closeLogOffModal = () => {
    setLogOffModal(false);
  };

  const getLocalPass = () => {
    return localStorage.getItem('desk-pass');
  };

  const logOut = () => {
    if (!logOffPass) {
      return;
    }
    if (getLocalPass() === logOffPass) {
      // 将iframe移出
      removeIframe();
      setIslogin(false);
      setLogOffModal(false);
      unlockScreen();
      message.warning('退出成功~');
    } else {
      setlogOffPassErr('密码错误~');
    }
  };

  //
  const handleScreenSizeChange = (e) => {
    setScreenSize(e.target.value);
  };

  const handleLockTimeChange = (value) => {
    console.log('faith=============', value);
    setLockTime(value);
  };

  const unlockScreen = () => {
    const bodyElement: any = document.querySelector('body');
    bodyElement.style.pointerEvents = 'auto';
  };

  const lockScreen = () => {
    setLock(true);
    // 使用 JavaScript 获取 body 元素
    const bodyElement: any = document.querySelector('body');
    // 将 body 元素的 pointer-events 属性设置为 none
    bodyElement.style.pointerEvents = 'none';
  };

  // 解决窗口变化影响内部元素布局
  const refreshIframe = () => {
    setTimeout(() => {
      reloadIframe(
        `${serviceIp}${serviceAdd}?clsid=${clsid}#/login?redirect=/visualization`
      );
    }, 300);
  };

  const systemSettingConfirm = () => {
    // 窗口大小
    if (screenSize === 'fullscreen') {
      ipcRenderer.send('fullscreen');
      refreshIframe();
    } else {
      const size = {
        width: parseInt(customWidth),
        height: parseInt(customHeight),
      };
      ipcRenderer.send('window-size-change', size);
      refreshIframe();
    }

    lockScreen();
    setServiceModal(false);
  };

  const content = (
    <div className={styles.menu}>
      <p className={styles.menuItem} onClick={openServiceModal}>
        <span>服务配置</span>
        <span>{`>`}</span>
      </p>
      <p className={styles.menuItem} onClick={openLogOffModal}>
        <span>退出登录</span>
        <span>{`>`}</span>
      </p>
    </div>
  );

  return (
    <div className={styles.main}>
      <div className={styles.globalCcnfig}>
        {islogin && (
          <Popover
            placement="leftBottom"
            title={`个人中心`}
            content={content}
            trigger="click"
          >
            <SettingTwoTone className={styles.settringImg} />
          </Popover>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.loginTitle}>登录</div>
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
              disabled={username == '' || password === '' || verifyCode === ''}
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
          value={serviceIp}
          onChange={(e) => setServiceIp(e.target.value)}
          className={styles.modalInput}
          placeholder="请输入服务地址"
        ></Input>
        <Input
          style={{ marginTop: 12 }}
          value={serviceAdd}
          onChange={(e) => setserviceAdd(e.target.value)}
          className={styles.modalInput}
          placeholder="请输入跳转地址"
        ></Input>
      </Modal>

      {/* 退出的Modal */}
      {logOffModal && (
        <Modal
          width={300}
          footer={null}
          title="退出登录"
          open={logOffModal}
          onCancel={closeLogOffModal}
        >
          <div className={styles.logOffModal}>
            <div className={styles.warnningDesc}>
              <img className={styles.logOffModalIcon} src={warning} alt="" />
              <span>为防止误操作，请您再次输入密码</span>
            </div>
            <div className={styles.logOffModalContent}>
              <span className={styles.title}>登录密码</span>
              <Input.Password
                className={styles.input}
                placeholder="请输入密码(6-16位字母加数字)"
                value={logOffPass}
                onChange={(e) => setLogOffPass(e.target.value)}
              />
            </div>
            {logOffPassErr && (
              <div className={styles.errorTip}>密码错误.....</div>
            )}

            <div className={styles.footer}>
              <Button
                onClick={logOut}
                disabled={logOffPass === ''}
                type="primary"
              >
                提交
              </Button>
              <Button onClick={closeLogOffModal}>取消</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 服务配置的Modal */}
      <Modal
        title="服务配置"
        open={serviceModal}
        width={400}
        onOk={systemSettingConfirm}
        cancelText={`取消`}
        okText={`提交`}
        onCancel={() => {
          setServiceModal(false);
        }}
      >
        <div className={styles.serviceConfigItem}>
          <label>服务地址</label>
          <Input
            placeholder="请输入服务url"
            value={serviceIp}
            onChange={(e) => setServiceIp(e.target.value)}
          />
        </div>
        <div className={styles.serviceConfigItem}>
          <label>跳转地址</label>
          <Input
            placeholder="请输入跳转url"
            value={serviceAdd}
            onChange={(e) => setserviceAdd(e.target.value)}
          />
        </div>
        <div className={styles.serviceConfigItem}>
          <label>屏幕尺寸</label>
          <Radio.Group onChange={handleScreenSizeChange} value={screenSize}>
            <Radio value="fullscreen">全屏</Radio>
            <Radio value="custom">自定义</Radio>
          </Radio.Group>
        </div>
        {screenSize === 'custom' && (
          <div style={{ marginLeft: 110 }} className={styles.serviceConfigItem}>
            <label style={{ width: 30 }}>W</label>
            <Input
              className={styles.serviceConfigItemCus}
              placeholder="宽度"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
            />
            <label style={{ width: 30, marginLeft: 30 }}>H</label>
            <Input
              className={styles.serviceConfigItemCus}
              placeholder="高度"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
            />
          </div>
        )}

        <div className={styles.serviceConfigItem}>
          <label>锁屏时间</label>
          <Select
            value={lockTime}
            className={styles.serviceConfigLock}
            onChange={handleLockTimeChange}
            defaultValue="0"
          >
            {lockTimeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};
export default Index;
