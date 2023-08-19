import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import {
  Input,
  Button,
  Modal,
  Popover,
  message,
  Radio,
  Select,
  Checkbox,
} from 'antd';
import { SettingTwoTone } from '@ant-design/icons';
import warning from '../../../assets/warning.png';
import { MD5 } from 'crypto-js';
import {
  createIframe,
  reloadIframe,
  removeIframe,
  unlockScreen,
  lockScreen as lockScreenUtil,
} from './util';
import { ipcRenderer } from 'electron';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
const { Option } = Select;

// Constants
const HOST = 'http://democ.1cloud.net.cn:18080';
const ADDRESS = '/web/visualization/index.html';

enum LOCAL_STORAGE {
  'PASS' = 'DESK_PASS',
  'USER_NAME' = 'EDSK_USER_NAME',
  'IP' = 'DESK_IP',
  'ADDRESS' = 'DESK_ADDRESS',
  'REMEMBER' = 'REMEMBER_PASS',
}

const Index = () => {
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

  const [popOpen, setPopOpen] = useState(false);
  const [rememberPass, setRememberPass] = useState(false);

  // 登录出错提示
  const [loginErrorText, setLoginErrorText] = useState('');

  // 服务配置State
  const [screenSize, setScreenSize] = useState('fullscreen');
  const [customWidth, setCustomWidth] = useState('1000');
  const [customHeight, setCustomHeight] = useState('650');
  const [clsid, setClsid] = useState('');

  const [lockTime, setLockTime] = useState('0'); // 设置默认值为 '0'，即"永不"
  const [serviceModal, setServiceModal] = useState(false);
  let countdownLockTimer: any = useRef(null);
  const lockTimeRef: any = useRef('0');

  // 获取验证码图片的URL
  const getCaptchaUrl = () => {
    let imageUrl = `${HOST}/captcha/create?_t=${new Date().valueOf()}`;
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blobData) => {
        const imageUrlObject = URL.createObjectURL(blobData);
        setCaptchaUrl(imageUrlObject);
      })
      .catch((error) => {
        console.error('Error fetching image:', error);
      });

    // return `${HOST}/captcha/create?_t=${new Date().valueOf()}`;
  };

  // 处理登录按钮点击事件
  const handleLogin = () => {
    //
    if (verifyCode.length !== 4) {
      setLoginErrorText('验证码错误');
      return;
    }

    // 调用登录接口，并带上验证码
    const hashedPass = MD5(password).toString();
    const apiUrl = `${HOST}/admin/login/doLogin?password=${hashedPass}&username=${username}&verifyCode=${verifyCode}`;
    // const apiUrl = `http://democ.1cloud.net.cn:18080/admin/login/doLogin?password=9dd4268bbb9d686ef15b1eeb841ccc13&username=zhxy&verifyCode=${verifyCode}`;

    // 在这里执行登录请求，可以使用fetch、axios或其他库
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data: any) => {
        // const mockData = {
        //   msg: '/brview',
        //   object: {
        //     clsid: '9351a079a10c48c2b6ba0419f8789a88',
        //     roleName: '一般用户',
        //     userName: 'zhxy',
        //   },
        //   success: true,
        // };
        if (data?.success === true) {
          setLoginErrorText('');
          setLocalPass(password);
          setLocalUser(username);
          setClsid(data?.object?.clsid);
          let iframeUrl = `${serviceIp}${serviceAdd}`;
          if (serviceAdd.includes(`?`)) {
            iframeUrl += `&clsid=${data?.object?.clsid}`;
          } else {
            iframeUrl += `?clsid=${data?.object?.clsid}`;
          }
          ipcRenderer.send('fullscreen');
          setTimeout(() => {
            createIframe(iframeUrl);
            setIslogin(true);
          }, 300);
        } else {
          getCaptchaUrl();
          setLoginErrorText(data?.msg);
        }
      })
      .catch((error) => {
        message.warning(error);
      });
  };

  // 更新验证码图片URL并设置节流
  // const updateChaUrl = useCallback(() => {
  //   if (canTrigger) {
  //     const url = getCaptchaUrl();
  //     setCaptchaUrl(url);
  //     setCanTrigger(false);
  //     setCountdown(30);
  //     const countdownTimer = setInterval(() => {
  //       setCountdown((prevCountdown) => prevCountdown - 1);
  //     }, 1000);
  //     setTimeout(() => {
  //       clearInterval(countdownTimer);
  //       setCanTrigger(true);
  //     }, 30000);
  //   }
  // }, [canTrigger]);

  const handleServiceIp = (value: string) => {
    localStorage.setItem(LOCAL_STORAGE.IP, value);
  };

  const getServiceIp = () => {
    return localStorage.getItem(LOCAL_STORAGE.IP) || HOST;
  };

  const getServiceAdd = () => {
    return localStorage.getItem(LOCAL_STORAGE.ADDRESS) || ADDRESS;
  };

  const handleServiceAdd = (value: string) => {
    localStorage.setItem(LOCAL_STORAGE.ADDRESS, value);
  };

  const handleRememberPass = (value: boolean) => {
    localStorage.setItem(LOCAL_STORAGE.REMEMBER, value + ``);
  };

  const getRememberPass = () => {
    return localStorage.getItem(LOCAL_STORAGE.REMEMBER);
  };

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
    // setCaptchaUrl(url);
  }, []);

  const reStartLockScreenCountDown = () => {
    // 能够执行【重置锁屏倒计时】的条件
    // 1、非永久 2、已经有倒计时锁屏 3、非锁屏状态
    if (lockTimeRef.current != '0' && countdownLockTimer.current && !lock) {
      // lockTime 锁屏lockTime分钟
      lockScreenCountDown(parseInt(lockTimeRef.current) * 1000 * 60);
    }
  };

  useEffect(() => {
    const handleMouseMove = () => {
      // 在这里执行鼠标移动事件的操作
      console.log('Mouse moved');
      reStartLockScreenCountDown();
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

      if (getRememberPass() === 'true') {
        setPassword(localStorage.getItem(LOCAL_STORAGE.PASS) || '');
        setUsername(localStorage.getItem(LOCAL_STORAGE.USER_NAME) || '');
      }
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

  const setLocalPass = (value: string) => {
    localStorage.setItem(LOCAL_STORAGE.PASS, value);
  };

  const setLocalUser = (value: string) => {
    localStorage.setItem(LOCAL_STORAGE.USER_NAME, value);
  };

  const getLocalPass = () => {
    return localStorage.getItem(LOCAL_STORAGE.PASS);
  };

  const logoutDone = () => {
    // 将iframe移出
    removeIframe();
    setIslogin(false);
    setLogOffModal(false);
    unlockScreen();

    if (!rememberPass) {
      setUsername('');
      setPassword('');
    }
    setVerifyCode('');

    getCaptchaUrl();
  };

  const logOut = () => {
    if (!logOffPass) {
      return;
    }
    if (getLocalPass() === logOffPass) {
      logoutDone();
      message.warning('退出成功~');
    } else {
      setlogOffPassErr('密码错误~');
    }
  };

  //
  const handleScreenSizeChange = (e) => {
    setScreenSize(e.target.value);
  };

  const handleLockTimeChange = (value: string) => {
    setLockTime(value);
    lockTimeRef.current = value;
  };

  const lockScreen = () => {
    setLock(true);
    console.log('锁屏了-时间=', new Date().valueOf());
    lockScreenUtil();
  };

  // 解决窗口变化影响内部元素布局
  const refreshIframe = () => {
    setTimeout(() => {
      reloadIframe(
        `${serviceIp}${serviceAdd}?clsid=${clsid}#/login?redirect=/visualization`
      );
    }, 300);
  };
  const lockScreenCountDown = (timeInMillis: number) => {
    // 先取消之前的计时器（如果有）
    clearTimeout(countdownLockTimer.current);

    // 设置新的计时器
    countdownLockTimer.current = setTimeout(lockScreen, timeInMillis);
  };

  useEffect(() => {
    let rememer = localStorage.getItem(LOCAL_STORAGE.REMEMBER);
    if (rememer && rememer === 'true') {
      setRememberPass(true);
      if (localStorage.getItem(LOCAL_STORAGE.PASS)) {
        setPassword(localStorage.getItem(LOCAL_STORAGE.PASS) || '');
      }
      if (localStorage.getItem(LOCAL_STORAGE.USER_NAME)) {
        setUsername(localStorage.getItem(LOCAL_STORAGE.USER_NAME) || '');
      }
    }

    return () => {
      clearTimeout(countdownLockTimer.current);
    };
  }, []);

  const systemSettingConfirm = () => {
    if ((!customWidth || !customHeight) && screenSize !== 'fullscreen') {
      message.warning('请填写屏幕尺寸宽、高');
      return;
    }

    if (getServiceIp() == serviceIp && getServiceAdd() == serviceAdd) {
    } else {
      // 如果是服务地址或者跳转地址修改，则回到登录页面
      logoutDone();
      unlockScreen();
      clearTimeout(countdownLockTimer.current);
      handleServiceIp(serviceIp);
      handleServiceAdd(serviceAdd);
      setServiceModal(false);
      return;
    }

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

    // 提交之前恢复之前的锁屏状态
    unlockScreen();
    clearTimeout(countdownLockTimer.current);
    if (lockTimeRef.current != '0') {
      // lockTime 锁屏lockTime分钟
      lockScreenCountDown(parseInt(lockTimeRef.current) * 1000 * 60);
    }

    setServiceModal(false);
  };

  const hiddenPopver = (e) => {
    setPopOpen(false);
  };

  const rememberThePassword = (e: CheckboxChangeEvent) => {
    handleRememberPass(e.target.checked);
    setRememberPass(e.target.checked);
  };

  const content = (
    <div className={styles.menu} onClick={hiddenPopver}>
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
            title={`个人中心${lock ? '(锁屏中)' : ''}`}
            content={content}
            open={popOpen}
            onOpenChange={(open) => {
              if (open) {
                setLogOffModal(false);
                setServiceModal(false);
              }
              setPopOpen(open);
            }}
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
                onClick={getCaptchaUrl}
                // onClick={updateChaUrl}
              />
            </div>
            {loginErrorText && (
              <div className={styles.loginErrorText}>{loginErrorText}</div>
            )}

            <div className={styles.rememberStyle}>
              <Checkbox checked={rememberPass} onChange={rememberThePassword}>
                记住密码
              </Checkbox>
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
          <div id="logoutDiv" className={styles.logOffModal}>
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
        wrapClassName="serviceWrapConfig"
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
        <div id="serviceConfigDiv" className={styles.serviceConfigItem}>
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
          <label style={{ width: 90 }}>屏幕尺寸</label>
          <Radio.Group onChange={handleScreenSizeChange} value={screenSize}>
            <Radio value="fullscreen">全屏</Radio>
            <Radio value="custom">自定义</Radio>
          </Radio.Group>
        </div>
        {screenSize === 'custom' && (
          <div style={{ marginLeft: 90 }} className={styles.serviceConfigItem}>
            <span style={{ marginRight: 10 }}>W</span>
            <Input
              className={styles.serviceConfigItemCus}
              placeholder="宽度"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
            />
            <span style={{ marginLeft: 10, marginRight: 10 }}>H</span>
            <Input
              className={styles.serviceConfigItemCus}
              placeholder="高度"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
            />
          </div>
        )}

        <div className={styles.serviceConfigItem}>
          <label style={{ width: 90 }}>锁屏时间</label>
          <Select
            popupClassName={styles.serviceConfigItemSelect}
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
