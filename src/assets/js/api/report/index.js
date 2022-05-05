import { request } from "../request";

const baseUrl = "/index.php/api/report"
//汇报列表
const reportList = data => {
    return request({
        url:baseUrl+"/getList",
        method: "post",
        data: data
    })
};

export default{
    reportList
}