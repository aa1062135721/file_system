import  report from "./report";        //汇报
import  target from "./target";        //目标
import  task from "./task";        //任务
import  common from "./common";        //公共接口

export default {
  ...task,
  ...report,
  ...target,
  ...common
}
