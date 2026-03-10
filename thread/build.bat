@echo off
setlocal

rem 设置构建目录名称
set BUILD_DIR=build

rem 如果构建目录不存在，则创建
if not exist %BUILD_DIR% (
    mkdir %BUILD_DIR%
)

rem 进入构建目录
pushd %BUILD_DIR%

echo [1/3] Running CMake configuration...
rem 运行 CMake 配置。如果需要特定生成器（如 MinGW），可以在这里添加 -G "MinGW Makefiles"
cmake .. 
if %errorlevel% neq 0 (
    echo CMake configuration failed!
    popd
    pause
    exit /b %errorlevel%
)

echo [2/3] Building project...
rem 运行构建（相当于 make）
rem --config Release 是为了在多配置生成器（如 Visual Studio）下指定构建类型
cmake --build . --config Debug
if %errorlevel% neq 0 (
    echo Build failed!
    popd
    pause
    exit /b %errorlevel%
)

echo [3/3] Running executable...
rem 自动查找并运行生成的 exe (排除 CMakeFiles 中的临时文件)
set FOUND_EXE=
for /r %%i in (*.exe) do (
    echo %%i | findstr /i "CMakeFiles" >nul
    if errorlevel 1 (
        set FOUND_EXE=%%i
        goto :RunExe
    )
)

:RunExe
if defined FOUND_EXE (
    echo Found executable: %FOUND_EXE%
    echo --------------------------------------------------
    "%FOUND_EXE%"
    echo --------------------------------------------------
) else (
    echo No executable found to run!
)

popd
echo.
pause
