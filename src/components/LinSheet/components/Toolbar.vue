<template>
  <div id="toolbar">
    <div class="items-container">
      <div class="items">
        <div class="lin-icon-btn">
          <span class="iconfont icon-si-glyph-arrow-backward"></span>
        </div>
        <div class="lin-icon-btn">
          <span class="iconfont icon-si-glyph-arrow-forward"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addEventListener } from '@/utils/event'

export default {
  name: 'Toolbar',
  components: {

  },
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    initEventListener () {
      addEventListener(window, 'updateScrollX', this.handleSheetScrollX)
      addEventListener(window, 'updateScrollY', this.handleSheetScrollY)
    }
  }
}
</script>

<style lang="scss">
#toolbar {
  z-index: 2;
  padding: 10px 2px;
  background-color: RGB(242, 244, 247);
  border-bottom: 1px solid RGB(226, 230, 237);

  .items-container {
    padding: 0 48px;

    .items {

      .lin-icon-btn {
        position: relative;
        display: inline-block;
        margin: 0 4px;
        padding: 4px;
        border-radius: 2px;
        font-size: 16px;
        line-height: 16px;

        &:hover {
          background-color: RGB(234, 236, 240);
        }
      }
    }
  }
}
</style>
