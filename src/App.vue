<template>
  <div id="app">
    <!-- 单元格绘制 -->
    <sheet-layer
      @s-click="handleClickSheet"
    />
    <!-- 选择框层 -->
    <!-- 修改层 -->
    <edit-layer />
  </div>
</template>

<script>
import SheetLayer from './components/SheetLayer.vue'
import EditLayer from './components/EditLayer.vue'

export default {
  name: 'app',
  components: {
    SheetLayer,
    EditLayer
  },
  data () {
    return {
      sheetCanvasContext: ''
    }
  },
  mounted () {
  },
  methods: {
    handleClickSheet ({ x, y }) {
      console.log(x)
      console.log(y)
    }
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
