<template>
  <div id="app">
    <lin-sheet />
  </div>
</template>

<script>
import LinSheet from './components/LinSheet'

export default {
  name: 'app',
  components: {
    LinSheet
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
