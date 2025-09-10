import requests
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import uuid

app = Flask(__name__)
CORS(app)  # 允许跨域访问

# PicGo API配置
API_KEY = "chv_SCD8y_523d2afc11f3750f6393f4632eaa50d1b2d3b5fa27da6d7091d1dc4cfd1fabec20ddb4debc5747e60d3f378acc8623e8a8e14b204c9ede25e09d07ef397913e6"
PICGO_URL = "https://www.picgo.net/api/1/upload"


def upload_file_to_picgo(file_path, **kwargs):
    """
    使用PicGo API v1.1上传文件 - 严格按照pythonProject1示例实现

    参数:
        file_path (str): 要上传的文件路径
        **kwargs: 可选参数，包括title, description, tags等

    返回:
        dict: 上传结果的JSON响应
    """
    # 请求头，包含API密钥
    headers = {
        "X-API-Key": API_KEY
    }

    # 准备文件数据
    files = {
        "source": open(file_path, "rb")
    }

    # 准备其他参数
    data = {}
    for key, value in kwargs.items():
        # 检查支持的可选参数
        if key in ['title', 'description', 'tags', 'album_id',
                   'category_id', 'width', 'expiration', 'nsfw',
                   'format', 'use_file_date']:
            data[key] = value

    try:
        # 发送POST请求
        print(f"发送请求到: {PICGO_URL}")
        print(f"请求头: {headers}")
        print(f"文件路径: {file_path}")
        print(f"额外参数: {data}")
        
        response = requests.post(
            PICGO_URL,
            headers=headers,
            files=files,
            data=data
        )

        # 检查请求是否成功
        response.raise_for_status()

        # 根据格式参数返回相应结果
        if kwargs.get('format') == 'txt':
            return {"success": True, "url": response.text.strip()}
        elif kwargs.get('format') == 'redirect':
            return {"success": True, "url": response.headers.get('Location', '')}
        else:  # 默认返回JSON
            result = response.json()
            if result.get('status_code') == 200 and result.get('image'):
                return {
                    "success": True,
                    "url": result['image']['url'],
                    "viewUrl": result['image'].get('url_viewer'),
                    "thumb": result['image'].get('thumb'),
                    "deleteUrl": result['image'].get('delete_url'),
                    "data": result
                }
            else:
                return {
                    "success": False,
                    "error": result.get('status_txt', '上传失败')
                }

    except requests.exceptions.RequestException as e:
        print(f"上传失败: {str(e)}")
        # 尝试获取错误响应内容
        if hasattr(e, 'response') and e.response is not None:
            print(f"响应状态码: {e.response.status_code}")
            print(f"响应头: {e.response.headers}")
            try:
                error_data = e.response.json()
                print(f"错误响应JSON: {error_data}")
                
                # 特别处理重复上传错误 - 尝试重新上传
                if (error_data.get('error', {}).get('message') == 'Duplicated upload' or 
                    error_data.get('error', {}).get('code') == 101):
                    
                    print("检测到重复上传，尝试添加随机参数重新上传...")
                    # 返回特殊标记，让调用者知道需要重试
                    return {"success": False, "error": "DUPLICATE_UPLOAD", "retry": True}
                
                return {"success": False, "error": error_data.get('message', str(e))}
            except:
                print(f"错误响应文本: {e.response.text}")
                # 特别处理重复上传错误
                if "duplicated upload" in e.response.text.lower():
                    return {"success": False, "error": "DUPLICATE_UPLOAD", "retry": True}
                return {"success": False, "error": e.response.text}
        return {"success": False, "error": str(e)}
    finally:
        # 确保文件被关闭
        files["source"].close()


@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """
    接收前端图片上传请求，使用PicGo API上传到图床
    """
    try:
        # 检查是否有文件
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "没有文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "未选择文件"}), 400

        # 验证文件类型
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({"success": False, "error": "不支持的文件格式"}), 400

        # 创建临时文件
        temp_dir = tempfile.gettempdir()
        import time
        timestamp = int(time.time())
        unique_filename = f"avatar_{timestamp}_{uuid.uuid4().hex[:12]}{file_ext}"
        temp_file_path = os.path.join(temp_dir, unique_filename)

        # 保存上传的文件到临时目录
        file.save(temp_file_path)

        try:
            # 使用PicGo API上传
            import time
            timestamp = int(time.time())
            random_id = uuid.uuid4().hex[:12]
            
            upload_options = {
                "title": f"avatar_{timestamp}_{random_id}",
                "description": f"User avatar uploaded via RAZOR AI at {timestamp}",
                "format": "json"
            }

            print(f"正在上传文件: {temp_file_path}")
            result = upload_file_to_picgo(temp_file_path, **upload_options)

            # 如果遇到重复上传，尝试重新上传
            if not result.get("success") and result.get("error") == "DUPLICATE_UPLOAD" and result.get("retry"):
                print("检测到重复上传，尝试使用不同参数重新上传...")
                
                # 第二次尝试：添加更多随机性
                new_timestamp = int(time.time() * 1000)  # 使用毫秒时间戳
                new_random = uuid.uuid4().hex
                
                retry_options = {
                    "title": f"avatar_retry_{new_timestamp}_{new_random[:16]}",
                    "description": f"User avatar retry upload at {new_timestamp}",
                    "format": "json",
                    "category_id": str(new_timestamp % 1000)  # 添加类别ID
                }
                
                result = upload_file_to_picgo(temp_file_path, **retry_options)
                
                # 如果第二次还是失败，尝试第三种方法
                if not result.get("success") and result.get("error") == "DUPLICATE_UPLOAD":
                    print("第二次尝试仍然失败，尝试修改文件...")
                    
                    # 第三次尝试：轻微修改文件（添加一个像素的透明边框）
                    try:
                        from PIL import Image
                        import io
                        
                        # 打开原始图片
                        with Image.open(temp_file_path) as img:
                            # 转换为RGBA模式以支持透明度
                            if img.mode != 'RGBA':
                                img = img.convert('RGBA')
                            
                            # 创建一个稍大的图片（添加1像素透明边框）
                            new_size = (img.size[0] + 2, img.size[1] + 2)
                            new_img = Image.new('RGBA', new_size, (0, 0, 0, 0))
                            new_img.paste(img, (1, 1))
                            
                            # 保存修改后的图片
                            modified_path = temp_file_path.replace('.', '_modified.')
                            new_img.save(modified_path, 'PNG')
                            
                            # 使用修改后的文件重新上传
                            final_options = {
                                "title": f"avatar_modified_{new_timestamp}_{new_random[:8]}",
                                "description": f"Modified user avatar at {new_timestamp}",
                                "format": "json"
                            }
                            
                            result = upload_file_to_picgo(modified_path, **final_options)
                            
                            # 清理修改后的文件
                            try:
                                os.remove(modified_path)
                            except:
                                pass
                                
                    except ImportError:
                        print("PIL库未安装，无法修改图片，返回错误")
                        result = {"success": False, "error": "图片已存在且无法生成唯一版本"}
                    except Exception as e:
                        print(f"修改图片失败: {e}")
                        result = {"success": False, "error": "图片处理失败"}

            if result.get("success"):
                print(f"上传成功! URL: {result['url']}")
                return jsonify(result)
            else:
                error_msg = result.get('error', '上传失败')
                if error_msg == "DUPLICATE_UPLOAD":
                    error_msg = "图片已存在，多次重试失败"
                print(f"上传失败: {error_msg}")
                return jsonify({"success": False, "error": error_msg}), 500

        finally:
            # 清理临时文件
            try:
                os.remove(temp_file_path)
            except:
                pass

    except Exception as e:
        print(f"处理上传请求时发生错误: {str(e)}")
        return jsonify({"success": False, "error": f"服务器错误: {str(e)}"}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({"status": "ok", "message": "Image upload service is running"})


if __name__ == '__main__':
    print("启动图片上传服务...")
    print("API端点: http://localhost:5000/api/upload-image")
    print("健康检查: http://localhost:5000/api/health")
    app.run(host='0.0.0.0', port=5000, debug=True)
