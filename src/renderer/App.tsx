import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  BrowserRouter,
} from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button, Input, message, Select } from 'antd';
import { ipcRenderer } from 'electron';
import settingGray from '../asset/images/icon/setting-gray.png';
import settingActive from '../asset/images/icon/setting-active.png';
import personalCenterGray from '../asset/images/icon/personal-center-gray.png';
import LabelIcon from '../asset/images/icon/label.svg';
import LabelIconActive from '../asset/images/icon/label-active.svg';
import { request } from '../utils/request';
import Login from './components/Login';
const { Option } = Select;
import 'antd/dist/antd.css';

import './App.css';

const data = [];

const Hello = (props) => {
  const [index, setIndex] = useState(0);

  const ref = useRef(0);
  const [value, setValue] = useState<string>();
  const [knowledgePointArr, setKnowledgePointArr] = useState(data);

  const [info, setInfo] = useState(JSON.parse(localStorage.getItem('info')));

  const [isShowSet, setIsShowSet] = useState(false);
  const [isShowLabel, setIsShowLabel] = useState(false);
  const [labelList, setLabelList] = useState([]);
  const [label, setLabel] = useState('通用');
  const timerRef = useRef<any>();

  const getTime = (size) => {
    // 每分钟阅读300字的速度
    // return (60 * 1000 * parseInt(size)) / 300;

    // 每分钟阅读250字的速度
    return (60 * 1000 * parseInt(size)) / 250;
  };

  useEffect(() => {
    request('https://kj.supermanklk.cn/memory/getKnowledeg', 'POST', {
      tel: info ? info.tel : 17637794541,
    }).then(function (res) {
      if (res.errcode == 0) {
        const reverseArr = res.results.reverse();
        setKnowledgePointArr(reverseArr);
      }
    });
    getLabelList();

    return () => {
      localStorage.removeItem('info');
    };
  }, []);

  const getLabelList = () => {
    request(
      'https://kj.supermanklk.cn/memory/getQuestionLabel',
      'GET',
      {}
    ).then((res) => {
      if (res.errcode === 0) {
        setLabelList(res.results);
      }
    });
  };

  const learnMore = () => {
    const { knowledge_url } = knowledgePointArr[index];
    ipcRenderer.send(
      'openUrl',
      'https://blog.csdn.net/cuishizun/article/details/82500335'
    );
    ipcRenderer.on('replay', (event, arg) => {
      console.log('收到主线程返回的信息22', arg);
    });
  };

  function createTime(current, time) {
    timerRef.current = setTimeout(() => {
      clearTimeout(timerRef.current);
      let nextCurrent = ref.current + 1;
      if (nextCurrent === knowledgePointArr.length) {
        nextCurrent = 0;
      }

      setIndex(nextCurrent);
      createTime(
        nextCurrent,
        getTime(knowledgePointArr[nextCurrent].knowledge_point.length)
      );
      ref.current = nextCurrent;
    }, time);
  }

  useEffect(() => {
    if (knowledgePointArr.length > 0) {
      setIndex(0);
      ref.current = 0;
      clearTimeout(timerRef.current);
      createTime(0, getTime(knowledgePointArr[0].knowledge_point.length));
    }
  }, [knowledgePointArr.length]);

  const addValue = () => {
    if (!value) return;
    if (value.length >= 425) {
      ipcRenderer.send('value-to-max', '知识点长度不能超过425个字符');
      return;
    }

    // 添加数据到数据库
    request('https://kj.supermanklk.cn/memory/setKnowledge', 'POST', {
      tel: info ? info.tel : 17637794541,
      knowledge: value,
      label,
    })
      .then((res) => {
        if (res.errCode === 200) {
          setKnowledgePointArr([
            {
              knowledge_point: value,
              knowledge_url: null,
              create_time: '2022-02-22T02:21:59.000Z',
              pid_tel: '17637794541',
            },
            ...knowledgePointArr,
          ]);
          setValue('');
        }
      })
      .catch((reason) => console.log(reason));
  };

  const addLabelValue = () => {
    if (!value) return;

    // 添加数据到数据库
    request('https://kj.supermanklk.cn/memory/addQuestionLabel', 'POST', {
      label: value,
      uploader: 'value',
    })
      .then((res) => {
        if (res.errcode === 0) {
          setValue('');
        }
      })
      .catch((reason) => console.log(reason));
  };

  const valueChange = (e) => {
    setValue(e.target.value);
  };

  const clickSet = () => {
    setIsShowSet(!isShowSet);
    setIsShowLabel(false);
  };

  const clickLabel = () => {
    setIsShowLabel(!isShowLabel);
    setIsShowSet(false);
  };

  const handleChange = (data) => {
    setLabel(data);
  };

  return (
    <div className="mainOuter">
      <div className="mainOuterHeader">
        {isShowSet ? (
          <>
            <button
              className={isShowSet === false ? 'none' : 'learn-more shakeX'}
              style={{ marginRight: 10 }}
              onClick={addValue}
            >
              Add+
            </button>
            <Input
              className={isShowSet === false ? 'none' : ' shakeX'}
              placeholder="请输入你的知识点"
              value={value}
              style={{
                width: 300,
                backgroundColor: '#2D3039',
                color: 'white',
                borderColor: '#454856',
              }}
              onChange={valueChange}
            />
            <Select
              className={'shakeX'}
              size="middle"
              defaultValue="通用"
              style={{
                width: 80,
                marginLeft: 10,
              }}
              onChange={handleChange}
            >
              {labelList &&
                labelList.map((label) => {
                  return (
                    <Option key={label.id} value={label.label}>
                      {label.label}
                    </Option>
                  );
                })}
              {/*               
              <Option value="lucy">Lucy</Option>
              <Option value="Yiminghe">yiminghe</Option> */}
            </Select>
          </>
        ) : null}

        {isShowLabel ? (
          <>
            <button
              className={isShowLabel === false ? 'none' : 'learn-more shakeX'}
              style={{ marginRight: 10 }}
              onClick={addLabelValue}
            >
              Add 标签
            </button>
            <input
              size="small"
              maxLength={6}
              className={isShowLabel === false ? 'none' : 'addSty shakeX'}
              placeholder="请输入你的标签,限制6字"
              value={value}
              onChange={valueChange}
            />
          </>
        ) : null}

        <img
          onClick={clickSet}
          className="mainOuterHeaderImg"
          src={isShowSet === true ? settingActive : settingGray}
          alt=""
        />

        <img
          onClick={clickLabel}
          className="labelHeaderImg"
          src={isShowLabel === true ? LabelIconActive : LabelIcon}
          alt=""
        />

        {info ? (
          <span className="have-login">{info.name.substr(0, 1)}</span>
        ) : (
          <Link to="/login" state={{ type: 'login' }}>
            <img
              onClick={() => {}}
              className="mainOuterHeaderActorImg"
              src={personalCenterGray}
              alt=""
            />
          </Link>
        )}
      </div>
      <div className="Hello">
        {/* <img width="200px" alt="icon" src={icon} /> */}
        {knowledgePointArr.length > 0 &&
          knowledgePointArr[index].knowledge_point}
      </div>
      <button
        onClick={() => {
          learnMore();
        }}
        className="learn-more"
      >
        Learn More
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
