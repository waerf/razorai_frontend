//vue.config.js 是 Vue CLI 项目的配置文件，用于对项目的默认配置进行自定义。
//自定义 Vue CLI 的默认配置，如配置代理、修改打包目录等。
const { defineConfig } = require('@vue/cli-service'); //引入defineConfig方法
const { spawn } = require('child_process');

let pythonProcess = null;

// 启动Python图片上传服务的函数
function startPythonService() {
  if (pythonProcess) {
    console.log('🔄 Python服务已在运行中...');
    return;
  }

  console.log('🚀 正在启动Python图片上传服务...');

  try {
    pythonProcess = spawn('python', ['image_upload_service.py'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Running on')) {
        console.log('✅ Python图片上传服务已启动: http://localhost:5000');
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();

      // 解析访问日志
      if (output.includes('HTTP/1.1')) {
        const match = output.match(
          /"(POST|GET|PUT|DELETE)\s+([^\s]+)\s+HTTP\/1\.1"\s+(\d+)/
        );
        if (match) {
          const [, method, path, status] = match;
          const statusEmoji = status.startsWith('2') ? '✅' : '❌';
          console.log(`${statusEmoji} ${method} ${path} - ${status}`);
        } else {
          console.log('📝 Python服务:', output);
        }
      } else if (
        // 过滤掉正常的调试信息，只显示真正的错误
        !output.includes('WARNING') &&
        !output.includes('Debug mode') &&
        !output.includes('Debugger is active') &&
        !output.includes('Debugger PIN') &&
        !output.includes('Restarting with stat') &&
        !output.includes('This is a development server') &&
        output.length > 0
      ) {
        console.error('❌ Python服务错误:', output);
      }
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`❌ Python服务退出，代码: ${code}`);
      }
      pythonProcess = null;
    });

    pythonProcess.on('error', (err) => {
      console.error('❌ 启动Python服务失败:', err.message);
      console.log(
        '💡 请确保已安装Python和相关依赖: pip install -r requirements.txt'
      );
      pythonProcess = null;
    });
  } catch (error) {
    console.error('❌ 启动Python服务异常:', error.message);
  }
}

// 停止Python服务
function stopPythonService() {
  if (pythonProcess) {
    console.log('🛑 正在停止Python图片上传服务...');
    pythonProcess.kill();
    pythonProcess = null;
  }
}

// 处理进程退出
process.on('SIGINT', () => {
  stopPythonService();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopPythonService();
  process.exit(0);
});

module.exports = defineConfig({
  transpileDependencies: true, //是否使用 babel-loader 对 node_modules 中的依赖进行转译
  devServer: {
    // 开发服务器配置
    setupMiddlewares: (middlewares) => {
      // 在开发服务器启动时启动Python服务
      console.log('🔧 Vue开发服务器启动中...');
      startPythonService();
      return middlewares;
    },
    proxy: {
      '/api': {
        // 代理的路径规则
        target: 'http://47.99.66.142:5253', // 代理的目标服务器地址
        // target: 'http://localhost:5253', // 代理的目标服务器地址
        changeOrigin: true, // 是否改变请求头中的来源
        pathRewrite: {
          '^/api': '', // 重写路径，将/api开头的请求路径去掉/api部分
        },
      },
    },
  },
  outputDir: 'dist', // 自定义构建文件的输出目录
  assetsDir: 'static', // 指定静态资源文件的目录
  pages: {
    // 多页面配置
    index: {
      // 配置首页入口
      entry: 'src/main.js', // 入口文件
      template: 'public/index.html', // 模板文件
      filename: 'index.html', // 输出文件名
      title: 'RAZOR-AI', // 义网页标题
    },
  },
});
