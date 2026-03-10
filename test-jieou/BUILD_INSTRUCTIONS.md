# 构建指南 (Build Instructions)

由于项目路径中包含中文字符（`新建文件夹`），推荐使用 **Ninja** 生成器，或者将项目移动到全英文路径下。

## 前置条件
确保已安装 CMake 和编译器（MinGW/GCC），以及推荐安装 Ninja。

## 构建步骤

### 方法一：使用 Ninja (推荐，支持中文路径)

```powershell
# 1. 创建并进入构建目录
if (-not (Test-Path build)) { mkdir build }
cd build

# 2. 生成构建系统 (使用 Ninja)
cmake -G "Ninja" ..

# 3. 编译
cmake --build .

# 4. 运行
./test-jieou.exe
```

### 方法二：使用 MinGW Makefiles (仅限全英文路径)

如果你将项目移动到了**纯英文路径**下（例如 `D:/projects/test-jieou`），可以使用默认的 MinGW 生成器：

```powershell
# 1. 创建并进入构建目录
if (-not (Test-Path build)) { mkdir build }
cd build

# 2. 生成构建系统 (使用 MinGW Makefiles)
cmake -G "MinGW Makefiles" ..

# 3. 编译
cmake --build .

# 4. 运行
./test-jieou.exe
```

## 常见问题
如果遇到 `No rule to make target ... 鏂板缓鏂 ...` 类似的错误，说明 Make 工具无法识别中文路径，请使用 **方法一** 或 **移动项目到全英文路径**。
