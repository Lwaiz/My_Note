let selectedBlogIndex = -1;
let selectedPyqIndex = -1;
// 用于存储随笔多次选择的图片
let pyqImageFiles = [];  // <-- 加在这里！

// 切换面板
function showBlog(){
  document.getElementById("btn-blog").classList.add("active");
  document.getElementById("btn-pyq").classList.remove("active");
  document.getElementById("blog-panel").classList.add("active");
  document.getElementById("pyq-panel").classList.remove("active");
}
function showPyq(){
  document.getElementById("btn-blog").classList.remove("active");
  document.getElementById("btn-pyq").classList.add("active");
  document.getElementById("blog-panel").classList.remove("active");
  document.getElementById("pyq-panel").classList.add("active");
}

// 清空输入框
function clearBlog(){
  document.getElementById('title').value='';
  document.getElementById('content').value='';
  document.getElementById('blogImg').value='';
}
function clearPyq(){
  document.getElementById('pyqContent').value='';
  document.getElementById('pyqImg').value='';
}

// 插入图片
async function insertBlogImage() {
  let title = document.getElementById('title').value.trim();
  if (!title) {
    alert("请先输入文章标题！");
    document.getElementById('blogImg').value = '';
    return;
  }

  let slug = title.replace(/[\\/:*?"<>|]/g, '');
  let imgInput = document.getElementById('blogImg');
  let contentElem = document.getElementById('content');
  let files = Array.from(imgInput.files);
  imgInput.value = '';

  const initialStart = contentElem.selectionStart;
  const initialEnd = contentElem.selectionEnd;
  const hasCursor = initialStart !== undefined && initialStart !== null;

  for (let file of files) {
    let imgName = file.name;
    let imgMd = `\n![${imgName}](images/${slug}/${imgName})\n`;

    let formData = new FormData();
    formData.append("title", title);
    formData.append("img", file);
    await fetch("/upload_blog_img", { method: "POST", body: formData });

    if (hasCursor) {
      let text = contentElem.value;
      contentElem.value = text.substring(0, initialStart) + imgMd + text.substring(initialEnd);
    } else {
      contentElem.value += imgMd;
    }
  }

  if(hasCursor){
    contentElem.focus();
    contentElem.selectionStart = contentElem.selectionEnd = initialStart + imgMd.length * files.length;
  }
}

// 自动生成JSON
async function autoGenBlogJson(){
  let form=new FormData();
  form.append("title",document.getElementById('title').value);
  form.append("content",document.getElementById('content').value);
  let res=await fetch("/gen_blog_json",{method:"POST",body:form});
  document.getElementById('blogJson').value=await res.text();
}
async function autoGenPyqJson(){
  let form=new FormData();
  let files = document.getElementById('pyqImg').files;
  for(let f of files) form.append("imgs",f);
  let res=await fetch("/gen_pyq_json",{method:"POST",body:form});
  document.getElementById('pyqJson').value=await res.text();
}

// 保存博客
async function saveBlog(){
  let title = document.getElementById('title').value.trim();
  let content = document.getElementById('content').value.trim();
  if(!title || !content){
    alert("标题和内容不能为空！");
    return;
  }

  let form = new FormData();
  form.append("title", title);
  form.append("content", content);
  
  let res = await fetch("/save_blog", {method:"POST", body:form});
  alert(await res.text());
  
  await loadBlogJson();
  clearBlog();
}

// // 保存随笔
// async function savePyq(){
//   let form = new FormData();
//   form.append("content", document.getElementById('pyqContent').value);
//   for(let f of document.getElementById('pyqImg').files) form.append("imgs",f);
  
//   let res = await fetch("/save_pyq", {method:"POST", body:form});
//   alert(await res.text());
  
//   await autoGenPyqJson();
//   clearPyq();
// }

// 读取JSON
async function loadBlogJson(){
  let res=await fetch("/load_blog_json",{method:"POST"});
  document.getElementById('blogJson').value=await res.text();
}
async function loadPyqJson(){
  let res=await fetch("/load_pyq_json",{method:"POST"});
  document.getElementById('pyqJson').value=await res.text();
}

// 博客删除弹窗
async function openBlogDeleteModal(){
  let res=await fetch("/load_blog_json",{method:"POST"});
  let data=JSON.parse(await res.text());
  let items = document.getElementById("blogModalItems");
  items.innerHTML = "";
  selectedBlogIndex = -1;

  data.posts.forEach((item,i)=>{
    let div = document.createElement("div");
    div.className = "modal-item";
    div.innerText = `${i+1}. ${item.title} (${item.date})`;
    div.onclick = ()=>{
      document.querySelectorAll("#blogModalItems .modal-item").forEach(el=>el.classList.remove("active"));
      div.classList.add("active");
      selectedBlogIndex = i;
    };
    items.appendChild(div);
  });
  document.getElementById("blogModal").style.display = "flex";
}
function closeBlogModal(){
  document.getElementById("blogModal").style.display = "none";
}
async function confirmDeleteBlog(){
  if(selectedBlogIndex < 0){alert("请选择一条博客");return;}
  if(!confirm("确定删除？"))return;

  let res=await fetch("/delete_blog_item",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`index=${selectedBlogIndex}`
  });
  alert(await res.text());
  closeBlogModal();
  loadBlogJson();
}

// 随笔删除弹窗
async function openPyqDeleteModal(){
  let res=await fetch("/load_pyq_json",{method:"POST"});
  let data=JSON.parse(await res.text());
  let items = document.getElementById("pyqModalItems");
  items.innerHTML = "";
  selectedPyqIndex = -1;

  data.pyq_list.forEach((item,i)=>{
    let div = document.createElement("div");
    div.className = "modal-item";
    div.innerText = `${item.timeCode} — ${item.file}`;
    div.onclick = ()=>{
      document.querySelectorAll("#pyqModalItems .modal-item").forEach(el=>el.classList.remove("active"));
      div.classList.add("active");
      selectedPyqIndex = i;
    };
    items.appendChild(div);
  });
  document.getElementById("pyqModal").style.display = "flex";
}
function closePyqModal(){
  document.getElementById("pyqModal").style.display = "none";
}
async function confirmDeletePyq(){
  if(selectedPyqIndex < 0){alert("请选择一条随笔");return;}
  if(!confirm("确定删除？"))return;

  let res=await fetch("/delete_pyq_item",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`index=${selectedPyqIndex}`
  });
  alert(await res.text());
  closePyqModal();
  loadPyqJson();
}

// 手动保存JSON
async function saveBlogJson(){
  let form=new FormData();
  form.append("json_content",document.getElementById('blogJson').value);
  let res=await fetch("/save_blog_json",{method:"POST",body:form});
  alert(await res.text());
  document.getElementById('blogJson').value = '';
}
async function savePyqJson(){
  let form=new FormData();
  form.append("pyq_json_content",document.getElementById('pyqJson').value);
  let res=await fetch("/save_pyq_json",{method:"POST",body:form});
  alert(await res.text());
  document.getElementById('pyqJson').value = '';
}


// Git 功能
const log=document.getElementById('gitLog');
async function gitAll(){log.innerText="执行中...";log.innerText=await(await fetch("/git_all",{method:"POST"})).text();}
async function gitAdd(){log.innerText="git add...";log.innerText=await(await fetch("/git_add",{method:"POST"})).text();}
async function gitStatus(){log.innerText="git status...";log.innerText=await(await fetch("/git_status",{method:"POST"})).text();}
async function gitCommit(){
  let m=document.getElementById("commitMsg").value;
  log.innerText="git commit...";
  log.innerText=await fetch("/git_commit",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`msg=${encodeURIComponent(m)}`
  }).then(r=>r.text());
}
async function gitPush(){log.innerText="git push...";log.innerText=await(await fetch("/git_push",{method:"POST"})).text();}

// 图片管理
async function openBlogImgManageModal(){
  let title = document.getElementById('title').value.trim();
  if(!title){
    alert("请先输入文章标题");
    return;
  }
  let form = new FormData();
  form.append("title", title);
  let res = await fetch("/get_blog_img_list",{method:"POST",body:form});
  let data = await res.json();
  renderBlogImgList(data.imgs);
  document.getElementById("blogImgManageModal").style.display = "flex";
}

function renderBlogImgList(imgList){
  let wrap = document.getElementById("blogImgManageList");
  wrap.innerHTML = "";
  if(imgList.length === 0){
    wrap.innerHTML = "<div style='padding:10px;color:#999;'>暂无图片</div>";
    return;
  }
  let title = document.getElementById('title').value.trim();
  let slug = title.replace(/[\\/:*?"<>|]/g, '');

  imgList.forEach(img=>{
    let item = document.createElement("div");
    item.className = "modal-item";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";
    item.innerHTML = `
      <span>${img}</span>
      <button style="background:#e74c3c;color:white;border:none;padding:4px 8px;border-radius:4px;" onclick="deleteBlogImg('${img}')">删除</button>
    `;
    wrap.appendChild(item);
  });
}

async function deleteBlogImg(imgName){
  let title = document.getElementById('title').value.trim();
  if(!confirm("确定要删除这张图片吗？")) return;

  let form = new FormData();
  form.append("title", title);
  form.append("img_name", imgName);
  let res = await fetch("/del_blog_single_img",{method:"POST",body:form});
  let ret = await res.text();
  if(ret !== "ok"){
    alert("删除失败");
    return;
  }

  let slug = title.replace(/[\\/:*?"<>|]/g, '');
  let targetMd = `![${imgName}](images/${slug}/${imgName})`;
  let content = document.getElementById("content").value;
  let lines = content.split("\n");
  lines = lines.filter(line => !line.includes(targetMd));
  document.getElementById("content").value = lines.join("\n");

  openBlogImgManageModal();
}

function closeBlogImgManageModal(){
  document.getElementById("blogImgManageModal").style.display = "none";
}

// 标题查重+自动加载
async function checkBlogTitleExist() {
  let title = document.getElementById('title').value.trim();
  if (!title) return;

  let form = new FormData();
  form.append("title", title);
  let res = await fetch("/load_blog_by_title", { method: "POST", body: form });
  let data = await res.json();

  if (data.exists) {
    document.getElementById('content').value = data.content;
    alert("✅ 该博客已存在，已自动加载原有内容！");
  } else {
    document.getElementById('content').value = "";
  }
}

// 关闭浏览器标签/网页时，自动请求关停Flask
window.addEventListener('beforeunload', function () {
  navigator.sendBeacon('/shutdown');
});


// // 随笔：多次累加上传图片（不覆盖）
// function addPyqImages() {
//   let input = document.getElementById('pyqImg');
//   // 把新选的图片追加到数组，不覆盖
//   pyqImageFiles.push(...input.files);
//   // 提示
//   if(pyqImageFiles.length > 0){
//     alert(`已添加 ${pyqImageFiles.length} 张图片`);
//   }
// }

// 随笔添加图片 + 预览
function addPyqImages() {
  let input = document.getElementById('pyqImg');
  // 追加图片，不覆盖
  pyqImageFiles.push(...input.files);
  // 渲染预览小图
  renderPyqImagePreview();
  // 清空input，下次可继续选
  input.value = '';
}

// 渲染随笔图片缩略预览
function renderPyqImagePreview() {
  let box = document.getElementById('pyqPreviewBox');
  box.innerHTML = '';

  pyqImageFiles.forEach((file, idx) => {
    let reader = new FileReader();
    reader.onload = function(e) {
      // 小图容器
      let item = document.createElement('div');
      item.style.position = 'relative';
      // 缩略图
      let img = document.createElement('img');
      img.src = e.target.result;
      img.style.width = '70px';
      img.style.height = '70px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      img.style.border = '1px solid #eee';
      // 删除按钮
      let delBtn = document.createElement('div');
      delBtn.innerText = '×';
      delBtn.style.position = 'absolute';
      delBtn.style.top = '-6px';
      delBtn.style.right = '-6px';
      delBtn.style.background = '#f44336';
      delBtn.style.color = '#fff';
      delBtn.style.width = '18px';
      delBtn.style.height = '18px';
      delBtn.style.borderRadius = '50%';
      delBtn.style.textAlign = 'center';
      delBtn.style.lineHeight = '18px';
      delBtn.style.fontSize = '14px';
      delBtn.style.cursor = 'pointer';
      // 点删除移除当前图片
      delBtn.onclick = function() {
        pyqImageFiles.splice(idx, 1);
        renderPyqImagePreview();
      };

      item.appendChild(img);
      item.appendChild(delBtn);
      box.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}


// 保存随笔（支持多次累加上传图片，全部写入JSON）
async function savePyq(){
  let form = new FormData();
  let content = document.getElementById('pyqContent').value;
  form.append("content", content);

  // 把所有累计的图片全部上传
  for (let f of pyqImageFiles) {
    form.append("imgs", f);
  }

  // 保存文章 + 图片
  let res = await fetch("/save_pyq", { method: "POST", body: form });
  alert(await res.text());

  // ✅ 关键：重新生成 JSON（会包含所有图片）
  await autoGenPyqJsonWithImages(pyqImageFiles);

  // 清空
  clearPyq();
  pyqImageFiles = [];
  document.getElementById('pyqPreviewBox').innerHTML = '';
}

// 生成随笔JSON（包含所有上传的图片）
async function autoGenPyqJsonWithImages(images) {
  let form = new FormData();
  for (let f of images) {
    form.append("imgs", f);
  }
  let res = await fetch("/gen_pyq_json", { method: "POST", body: form });
  document.getElementById('pyqJson').value = await res.text();
}