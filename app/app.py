from flask import Flask, request, render_template
import os
import time
import re
import subprocess
import json
import shutil
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ========== 路径配置 ==========
# 读取环境变量，若不存在则设置默认值
BASE_NOTES = os.getenv("BASE_NOTES", "./docs/notes") 
BASE_PYQ = os.getenv("BASE_PYQ", "./docs/pyq")
GIT_REPO_PATH = os.getenv("GIT_REPO_PATH", "./")

# JSON 索引文件路径
POSTS_JSON = os.path.join(BASE_NOTES, "posts.json")
PYQ_LIST_JSON = os.path.join(BASE_PYQ, "pyq_list.json")

# 自动创建目录
os.makedirs(BASE_NOTES, exist_ok=True)
os.makedirs(BASE_PYQ, exist_ok=True)
os.makedirs(os.path.join(BASE_NOTES, "images"), exist_ok=True)
os.makedirs(os.path.join(BASE_PYQ, "images"), exist_ok=True)

@app.route('/')
def index():
    return render_template("index.html")

def safe_name(s):
    return re.sub(r'[\\/:*?"<>|]', '', s)

# ------------------------------
# 工具：读取 JSON
# ------------------------------
def load_json(path, default_struct):
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return default_struct
    return default_struct

# ------------------------------
# 博客图片即时上传（插入时自动保存，解决只存最后一张问题）
# ------------------------------
@app.route('/upload_blog_img', methods=['POST'])
def upload_blog_img():
    title = request.form.get("title", "").strip()
    if not title:
        return "请先输入文章标题", 400
    
    slug = safe_name(title)
    # 图片保存路径：images/标题/
    img_dir = os.path.join(BASE_NOTES, "images", slug)
    os.makedirs(img_dir, exist_ok=True)
    
    # 获取单张图片并保存
    img = request.files.get("img")
    if not img or not img.filename:
        return "无效图片", 400
    
    img.save(os.path.join(img_dir, img.filename))
    return "上传成功"

# ------------------------------
# 获取当前博客图片列表
# ------------------------------
@app.route('/get_blog_img_list', methods=['POST'])
def get_blog_img_list():
    title = request.form.get("title", "").strip()
    slug = safe_name(title)
    img_dir = os.path.join(BASE_NOTES, "images", slug)
    img_list = []
    if os.path.exists(img_dir):
        for f in os.listdir(img_dir):
            if os.path.isfile(os.path.join(img_dir, f)):
                img_list.append(f)
    return json.dumps({"imgs": img_list}, ensure_ascii=False)

# ------------------------------
# 删除当前博客单张图片
# ------------------------------
@app.route('/del_blog_single_img', methods=['POST'])
def del_blog_single_img():
    title = request.form.get("title", "").strip()
    img_name = request.form.get("img_name", "").strip()
    slug = safe_name(title)
    img_path = os.path.join(BASE_NOTES, "images", slug, img_name)
    if os.path.exists(img_path):
        os.remove(img_path)
        return "ok"
    return "文件不存在"


# ------------------------------
# 根据标题检查博客是否存在，存在则加载内容
# ------------------------------
@app.route('/load_blog_by_title', methods=['POST'])
def load_blog_by_title():
    title = request.form.get("title", "").strip()
    if not title:
        return json.dumps({"exists": False}, ensure_ascii=False)
    
    slug = safe_name(title)
    md_path = os.path.join(BASE_NOTES, f"{slug}.md")
    
    # 检查文件是否存在
    if not os.path.exists(md_path):
        return json.dumps({"exists": False}, ensure_ascii=False)
    
    # 读取MD内容
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    return json.dumps({
        "exists": True,
        "content": content
    }, ensure_ascii=False)

# ------------------------------
# 修复保存博客：标题存在时覆盖文件，不重复添加JSON
# ------------------------------
@app.route('/save_blog', methods=['POST'])
def save_blog():
    title = request.form.get("title", "无标题").strip()
    content = request.form.get("content", "")
    
    if not title or not content:
        return "标题和内容不能为空！"
        
    slug = safe_name(title)
    md_name = f"{slug}.md"
    md_path = os.path.join(BASE_NOTES, md_name)

    # 保存/覆盖MD文件
    with open(md_path, "w", encoding='utf-8') as f:
        f.write(content)

    # 图片路径
    img_dir = os.path.join(BASE_NOTES, "images", slug)
    os.makedirs(img_dir, exist_ok=True)

    # 处理JSON：去重 + 更新
    data = load_json(POSTS_JSON, {"posts": []})
    date_str = time.strftime("%Y-%m-%d")
    
    # 移除旧的同标题数据
    data["posts"] = [item for item in data["posts"] if item.get("slug") != slug]
    
    # 添加新数据
    new_item = {
        "slug": slug,
        "title": title,
        "description": "暂无描述",
        "date": date_str,
        "series": "",
        "category": ""
    }
    data["posts"].insert(0, new_item)
    
    with open(POSTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return "博客保存成功！"

# ------------------------------
# 保存随笔
# ------------------------------
@app.route('/save_pyq', methods=['POST'])
def save_pyq():
    content = request.form.get("content", "")
    t = time.strftime("%Y%m%d_%H%M")
    md_name = f"{t}_pyq.md"
    md_path = os.path.join(BASE_PYQ, md_name)

    with open(md_path, "w", encoding='utf-8') as f:
        f.write(content)

    img_dir = os.path.join(BASE_PYQ, "images", t)
    os.makedirs(img_dir, exist_ok=True)
    imgs = request.files.getlist("imgs")
    for img in imgs:
        if img.filename:
            img.save(os.path.join(img_dir, img.filename))

    return "随笔已保存"

# ------------------------------
# 生成博客JSON（匹配示例）
# ------------------------------
@app.route('/gen_blog_json', methods=['POST'])
def gen_blog_json():
    title = request.form.get("title", "无标题")
    slug = safe_name(title)
    date_str = time.strftime("%Y-%m-%d")

    new_item = {
        "slug": slug,
        "title": title,
        "description": "暂无描述",
        "date": date_str,
        "series": "",
        "category": ""
    }

    data = load_json(POSTS_JSON, {"posts": []})
    return json.dumps(data, ensure_ascii=False, indent=2)

# ------------------------------
# 生成随笔JSON
# ------------------------------
@app.route('/gen_pyq_json', methods=['POST'])
def gen_pyq_json():
    content = request.form.get("content", "")
    t = time.strftime("%Y%m%d_%H%M")
    md_name = f"{t}_pyq.md"

    img_list = []
    imgs = request.files.getlist("imgs")
    for img in imgs:
        if img.filename:
            img_list.append(img.filename)

    new_item = {
        "file": md_name,
        "timeCode": t,
        "content": content[:50].replace('\n',' '),
        "images": img_list
    }

    data = load_json(PYQ_LIST_JSON, {"pyq_list": []})
    data["pyq_list"].insert(0, new_item)
    
    return json.dumps(data, ensure_ascii=False, indent=2)

# ------------------------------
# 读取JSON
# ------------------------------
@app.route('/load_blog_json', methods=['POST'])
def load_blog_json():
    data = load_json(POSTS_JSON, {"posts": []})
    return json.dumps(data, ensure_ascii=False, indent=2)

@app.route('/load_pyq_json', methods=['POST'])
def load_pyq_json():
    data = load_json(PYQ_LIST_JSON, {"pyq_list": []})
    return json.dumps(data, ensure_ascii=False, indent=2)

# ------------------------------
# 删除博客（纯标题匹配）
# ------------------------------
@app.route('/delete_blog_item', methods=['POST'])
def delete_blog_item():
    idx = int(request.form.get("index", -1))
    data = load_json(POSTS_JSON, {"posts": []})
    
    if 0 <= idx < len(data.get("posts", [])):
        item = data["posts"].pop(idx)
        slug = item.get("slug", "")
        
        # 精准匹配：标题.md + 标题文件夹
        md_path = os.path.join(BASE_NOTES, f"{slug}.md")
        img_dir = os.path.join(BASE_NOTES, "images", slug)

        if os.path.exists(md_path):
            os.remove(md_path)
        if os.path.exists(img_dir):
            shutil.rmtree(img_dir)

        with open(POSTS_JSON, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        return "✅ 博客、MD文件、图片已全部删除"
    
    return "❌ 序号无效"

# ------------------------------
# 删除随笔
# ------------------------------
@app.route('/delete_pyq_item', methods=['POST'])
def delete_pyq_item():
    idx = int(request.form.get("index", -1))
    data = load_json(PYQ_LIST_JSON, {"pyq_list": []})
    
    if 0 <= idx < len(data.get("pyq_list", [])):
        item = data["pyq_list"].pop(idx)
        filename = item.get("file", "")
        timeCode = item.get("timeCode", "")

        md_path = os.path.join(BASE_PYQ, filename)
        if os.path.exists(md_path):
            os.remove(md_path)

        img_dir = os.path.join(BASE_PYQ, "images", timeCode)
        if os.path.exists(img_dir):
            shutil.rmtree(img_dir)

        with open(PYQ_LIST_JSON, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        return "✅ 随笔、MD文件、图片文件夹已全部删除"
    
    return "❌ 序号无效"

# ------------------------------
# 保存JSON
# ------------------------------
@app.route('/save_blog_json', methods=['POST'])
def save_blog_json():
    json_str = request.form.get("json_content", "")
    try:
        json_obj = json.loads(json_str)
        with open(POSTS_JSON, "w", encoding='utf-8') as f:
            json.dump(json_obj, f, ensure_ascii=False, indent=2)
        return "✅ posts.json 已保存"
    except Exception as e:
        return f"❌ JSON错误：{str(e)}"

@app.route('/save_pyq_json', methods=['POST'])
def save_pyq_json():
    json_str = request.form.get("pyq_json_content", "")
    try:
        json_obj = json.loads(json_str)
        with open(PYQ_LIST_JSON, "w", encoding='utf-8') as f:
            json.dump(json_obj, f, ensure_ascii=False, indent=2)
        return "✅ pyq_list.json 已保存"
    except Exception as e:
        return f"❌ JSON错误：{str(e)}"

# ------------------------------
# Git 功能
# ------------------------------
def run_git(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, cwd=GIT_REPO_PATH, text=True, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        return e.output

@app.route('/git_add', methods=['POST'])
def git_add():
    return run_git("git add .")

@app.route('/git_status', methods=['POST'])
def git_status():
    return run_git("git status")

@app.route('/git_commit', methods=['POST'])
def git_commit():
    msg = request.form.get("msg", "auto commit")
    return run_git(f'git commit -m "{msg}"')

@app.route('/git_push', methods=['POST'])
def git_push():
    return run_git("git push")

@app.route('/git_all', methods=['POST'])
def git_all():
    log = ""
    log += run_git("git add .") + "\n"
    log += run_git('git commit -m "auto update"') + "\n"
    log += run_git("git push")
    return log


import signal
# 关闭网页自动关停Flask服务
# 关闭网页自动关停服务（修复405错误，支持POST）
@app.route('/shutdown', methods=['POST'])
def shutdown():
    try:
        # 安全关闭Flask进程
        os.kill(os.getpid(), signal.SIGTERM)
        return "服务已关闭", 200
    except:
        return "关闭失败", 500

if __name__ == "__main__":
    # 从环境变量读取DEBUG，默认False（生产环境）
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    app.run(debug=debug_mode) 