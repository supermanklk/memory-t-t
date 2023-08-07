import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button, Input, message } from 'antd';
import settingGray from '../asset/images/icon/setting-gray.png';
import settingActive from '../asset/images/icon/setting-active.png';
import personalCenterActive from '../asset/images/icon/personal-center-active.png';
import personalCenterGray from '../asset/images/icon/personal-center-gray.png';
import { ipcRenderer } from 'electron';
import { request } from '../utils/request';

import SettingsPage from '../SettingsPage'; // 设置页面组件

import './App.css';

const data = [
  // 'Electron运行起来有 主进程、GPU进程、渲染进程',
  // 'React架构3大模块: 1、调度 2、协调 3、渲染',
  // 'Access-Control-Allow-Origin',
  // '在forEach中，使用 return 或 return false 跳出循环，效果与 for 中 continue 一样。',
  // 'return 只存在于函数体中，for，for-in，for-of都不支持return',
  // '节流---王者荣耀释放技能, 防抖---王者荣耀回城',
  // 'webpack配置mode:development是关闭代码压缩',
  // "如何产出一个lib { fileName:'lodash.js', path: distPath, library: 'lodash }",
  // 'http 1.0 短连接，请求100图，100次tcp握手挥手、 1.1 长连接，100张图一次tcp握手挥手、2.0 长连接+io多路复用',
  // '打开一个网站，用户的最大的一个忍耐值3s',
  // 'DDOS攻击就是很多人同时访问了一个服务器，这就是为什么浏览器会限制同时发起TCP链接的个数',
  // '应用层 传输层 网络层 链路层 物理层',
  // '二进制分帧层： 请求a.js和b.css，a.js对应的stream的id为1，b.css对应的stream的id为2，a.js的head帧为head1，数据帧为data1，b.js的head帧为head2，数据帧为data2。浏览器可以将head1、data1、head2、data2同时放入TCP信道进行报文传输，在TCP层，可能会进一步对这些数据进行拆分，拆成不同报文序号进行传输，但是可以无需关注这层是如何拆分、组装的。因为可以在Http2.0的二进制帧层进行有序处理，将接收到的stream的id为1的放一起处理，接收到的stream的id为2的放一起处理。通过这种方式就可以解决Http1.1中存在的请求阻塞问题，试想：假如a.js的处理很慢，服务器可以先将b.css的处理结果返回，因为采用了stream的id编号，所以可以在Http2.0的二进制帧层先对b.css的stream的id进行重组，将b.css的响应交付于应用层处理。',
  // 'Notion:toc table of content',
  // '构造函数、原型、实例之间的关系：每个构造函数都有一个原型对象，原型对象有一个属性指回构造函数，实例有一个内部指针指向原型对象',
  // '确定事例与原型之间的是否存在关系可以有2种方式, instanceOf/isPrototypeOf(Object.prototype.isPrototypeOf(instance))',
  // '原型链继承的弊端：原型上包含引用变量会在实例之间共享，这就是为什么通常属性要放在构造函数里面，但是一旦使用了原型链继承就会导致构造函数的属性跑到原型上',
  // '原型链继承、盗用构造函数、组合继承、寄生组合继承',
  // '如何禁止复制-css >> user-select: none;',
  // 'shanyue 山月',
  // '!important>行内样式>ID选择器 > 类选择器 | 属性选择器 | 伪类选择器 > 元素选择器',
];

const Hello = () => {
  const [index, setIndex] = useState(0);
  const ref = useRef(0);
  const [value, setValue] = useState<string>();
  const [knowledgePointArr, setKnowledgePointArr] = useState(data);

  const [isShowSet, setIsShowSet] = useState(false);
  const timerRef = useRef<any>();

  const getTime = (size) => {
    // 每分钟阅读300字的速度
    // return (60 * 1000 * parseInt(size)) / 300;

    // 每分钟阅读250字的速度
    return (60 * 1000 * parseInt(size)) / 250;
  };

  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  // useEffect(() => {
  //   fetch('https://kj.supermanklk.cn/memory/getKnowledeg')
  //     .then(function (response) {
  //       return response.json();
  //     })
  //     .then(function (res) {
  //       if (res.errcode == 0) {
  //         let reverseArr = res.results.reverse();
  //         setKnowledgePointArr(reverseArr);
  //       }
  //     });
  // }, []);

  // const learnMore = () => {
  //   let { knowledge_url } = knowledgePointArr[index];
  //   ipcRenderer.send(
  //     'openUrl',
  //     'https://blog.csdn.net/cuishizun/article/details/82500335'
  //   );
  //   ipcRenderer.on('replay', (event, arg) => {
  //     console.log('收到主线程返回的信息22', arg);
  //   });
  // };

  // function createTime(current, time) {
  //   timerRef.current = setTimeout(() => {
  //     clearTimeout(timerRef.current);
  //     let nextCurrent = ref.current + 1;
  //     if (nextCurrent === knowledgePointArr.length) {
  //       nextCurrent = 0;
  //     }

  //     setIndex(nextCurrent);
  //     createTime(
  //       nextCurrent,
  //       getTime(knowledgePointArr[nextCurrent].knowledge_point.length)
  //     );
  //     ref.current = nextCurrent;
  //   }, time);
  // }

  // useEffect(() => {
  //   if (knowledgePointArr.length > 0) {
  //     setIndex(0);
  //     ref.current = 0;
  //     clearTimeout(timerRef.current);
  //     createTime(0, getTime(knowledgePointArr[0].knowledge_point.length));
  //   }
  // }, [knowledgePointArr.length]);

  // const addValue = () => {
  //   if (!value) return;
  //   if (value.length >= 425) {
  //     ipcRenderer.send('value-to-max', '知识点长度不能超过425个字符');
  //     return;
  //   }

  //   // 添加数据到数据库
  //   request('https://kj.supermanklk.cn/memory/setKnowledge', 'POST', {
  //     tel: 17637794541,
  //     knowledge: value,
  //   }).then((res) => {
  //     if (res.errCode === 200) {
  //       setKnowledgePointArr([
  //         {
  //           knowledge_point: value,
  //           knowledge_url: null,
  //           create_time: '2022-02-22T02:21:59.000Z',
  //           pid_tel: '17637794541',
  //         },
  //         ...knowledgePointArr,
  //       ]);
  //       setValue('');
  //     } else {
  //       // message.warning(res.errMsg);
  //     }
  //   });
  // };

  // const valueChange = (e) => {
  //   setValue(e.target.value);
  // };

  // const clickSet = () => {
  //   setIsShowSet(!isShowSet);
  // };

  return (
    <div>
      <SettingsPage
        onSave={(size) => {
          ipcRenderer.send('window-size-change', size);
        }}
        // onSave=(size) => {
        //   console.log('faith=============size', size);
        //   // const size = { width: 100, height: 200 };
        //   // console.log('faith=============6', width, height);
        //   // ipcRenderer.send('window-size-change', size);
        //   // console.log('faith=============save1');
        // }}
      />
    </div>
  );

  return (
    <div className="mainOuter">
      <div className={'mainOuterHeader'}>
        <Button
          className={isShowSet === false ? 'none' : 'learn-more shakeX'}
          style={{ marginRight: 10 }}
          onClick={addValue}
        >
          Add+
        </Button>
        <Input
          size="small"
          className={isShowSet === false ? 'none' : 'addSty shakeX'}
          placeholder={'请输入你的知识点'}
          value={value}
          onChange={valueChange}
        />
        <img
          onClick={clickSet}
          className={'mainOuterHeaderImg'}
          onMouseOver={() => {}}
          src={isShowSet === true ? settingActive : settingGray}
          alt=""
        />
        <img
          onClick={() => {}}
          className={'mainOuterHeaderActorImg'}
          onMouseOver={() => {}}
          src={personalCenterGray}
          alt=""
        />
      </div>
      {/*<div className="addInputStyOuter">*/}
      {/*  <Button*/}
      {/*    className="learn-more"*/}
      {/*    size={'small'}*/}
      {/*    style={{ marginRight: 10 }}*/}
      {/*    onClick={addValue}*/}
      {/*  >*/}
      {/*    Add+*/}
      {/*  </Button>*/}
      {/*  <Input*/}
      {/*    className="addSty"*/}
      {/*    placeholder={'请添加你的知识点'}*/}
      {/*    value={value}*/}
      {/*    onChange={valueChange}*/}
      {/*  />*/}
      {/*</div>*/}

      <div className="Hello">
        {/*<img width="200px" alt="icon" src={icon} />*/}
        {knowledgePointArr.length > 0 &&
          knowledgePointArr[index].knowledge_point}
      </div>
      <Button
        onClick={() => {
          learnMore();
        }}
        className="learn-more"
      >
        Learn More
      </Button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
