const state = {
  nodeId: [],  // 选中的节点ID
  moveNodeId: [], // 移动页面选中的节点ID
  recentBrowsNodeId: [] // 最近浏览节点ID
}

const mutations = {
  // 首页的节点信息操作
  addId (state, id) { // 存入选中的节点ID
    state.nodeId.push(id)
  },

  reduceId (state) { // 点击返回Icons时删除当前的节点ID
    state.nodeId.pop()
  },

  replaceNodeId (state, arr) { // 预览文件后，返回到当前页面。获取sessStorage中存入的预览文件URL跳转前的节点ID
    state.nodeId = arr
  },

  clearNodeId (state) { // 离开时清空所有存入的节点ID
    state.nodeId = []
  },

  // 移动页面的节点信息操作
  addMoveId (state, id) {
    state.moveNodeId.push(id)
  },

  reduceMoveId (state) {
    state.moveNodeId.pop()
  },

  clearMoveId (state) {
    state.moveNodeId = []
  },

  // 最近预览页面的节点信息操作
  addRecentBId (state, id) {
    state.recentBrowsNodeId.push(id)
  },

  reduceRecentBId (state) {
    state.recentBrowsNodeId.pop()
  },

  replaceRecentNodeId (state, arr) {
    state.recentBrowsNodeId = arr
  },

  clearReduceRecentBId (state) {
    state.recentBrowsNodeId = []
  }
}

const actions = {
  
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}