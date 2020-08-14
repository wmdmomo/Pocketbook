// pages/components/progress/progress.js
var windWidth = wx.getSystemInfoSync().windowWidth
import Animation from './../../../utils/animation'
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    inList: {
      type: Array
    },
    expList: {
      type: Array
    },
    intotal: {
      type: Number,
      value: 0
    },
    exptotal: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    width: windWidth,
    canvasWidth: windWidth * 0.5,
    x_position: windWidth / 2,
    height: windWidth * 0.5 + 40,
    textChoice: '',
    flag: false,
    index: 0,
    exp_color: ["#ffd460", "#ffcf7f", "#ffde7d", "#f9ed69", "#fce38a"],
    in_color: ["#3c9099", "#1fab89", "#62d2a2", "#9df3c4", "#a7d7c5"],
    angleList: [],
    radius: 0
  },

  ready: function () {
    var that = this
    setTimeout(function () {
      that.showRing(that.data.expList, that.data.exptotal, 0)
    }, 50)

  },

  /**
   * 组件的方法列表
   */
  methods: {
    choicePart(e) {
      var curx = e.touches[0].clientX
      var cury = e.touches[0].clientY
      var x = this.data.x_position
      var y = this.data.height / 2 + e.currentTarget.offsetTop

      var radius_in = this.data.height / 2 - this.data.radius / 2
      var radius_out = radius_in + this.data.radius / 2
      var angle = -1
      var index = 0
      var dis = Math.pow(curx - x, 2) + Math.pow(cury - y, 2)
      if (dis <= Math.pow(radius_out, 2) && dis >= Math.pow(radius_in, 2)) {
        angle = Math.atan(Math.abs(cury - y) / (Math.abs(curx - x)))
        if (curx > x) {
          if (cury < y) angle = 2 * Math.PI - angle
        } else {
          if (cury < y) angle = Math.PI + angle
          else angle = Math.PI - angle
        }
      }
      for (let i = 0; i < this.data.angleList.length; i++) {
        if (i == this.data.angleList.length - 1) {
          if (angle >= this.data.angleList[i].startAngle) {
            index = i
            break
          }
        }
        if (this.data.angleList[i].startAngle <= angle && this.data.angleList[i + 1].startAngle > angle) {
          index = i
          break
        }
      }
      this.setData({
        index: index
      })
      this.triggerEvent('figureSwitch', {
        type: this.data.flag,
        index: this.data.index
      })

    },
    cailPieAngle(series, count, process = 1) {
      let startAngle = 0;
      return series.map((item) => {
        item.proportion = item.val / count * process
        item.startAngle = startAngle
        startAngle += 2 * Math.PI * item.proportion
        return item;
      })
    },
    drawPie(ctx, series, x, y, radius, count, line, process, flag, id) {
      var pieSeries = this.cailPieAngle(series, count, process)
      this.setData({
        angleList: pieSeries
      })
      var that = this
      pieSeries.forEach((item, index) => {
        ctx.beginPath()
        ctx.lineWidth = line
        ctx.arc(x, y, radius, item.startAngle, item.startAngle + 2 * Math.PI * item.proportion)
        if (flag == 0)
          ctx.strokeStyle = that.data.exp_color[index % that.data.exp_color.length]
        else
          ctx.strokeStyle = that.data.in_color[index % that.data.in_color.length]
        ctx.stroke()
      })
    },
    showRing: function (itemlist, total, flag) {
      const query = wx.createSelectorQuery().in(this)
      query.select('#myCanvas')
        .fields({
          node: true,
          size: true
        })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio
          var ori_radius = this.data.canvasWidth / 2
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          const x = this.data.x_position * dpr
          const y = this.data.height / 2 * dpr
          const radius = (ori_radius - 10) * dpr
          const line = radius * 0.5
          this.setData({
            radius: ori_radius - 10
          })
          Animation({
            duration: 1000,
            onProcess: (process) => {
              this.drawPie(ctx, itemlist, x, y, radius, total, line, process, flag)
            }
          })


        })
    },
    switchItem: function () {
      this.data.flag = !this.data.flag
      this.setData({
        flag: this.data.flag,
        index: 0
      })
      this.triggerEvent('figureSwitch', {
        type: this.data.flag,
        index: this.data.index
      })
      if (this.data.flag) {
        this.showRing(this.data.inList, this.data.intotal, 1)
      } else {
        this.showRing(this.data.expList, this.data.exptotal, 0)
      }
    }
  }
})