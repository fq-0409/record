git --version

git config --global user.name "你的GitHub用户名"
git config --global user.email "你的邮箱"
git config --global --list

ssh配置：
ssh-keygen -t ed25519 -C "你的邮箱"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com

git clone 

git pull (拉取远端最新代码)
git branch
git checkout -b (切换到自己的分支push)

git add 
git commit
git push

错误处理：
git status
git remote -v (查看远程仓库地址)

