#include <iostream>

void demoFunction()
{
    int unused_var = 0; // warn: unused variable
}

int main()
{
    int x = 0; // warn: variable 'x' is uninitialized

    // 这里使用了未初始化的变量 x，这是未定义行为
    if (x > 10)
    {
        std::cout << "x is large" << std::endl;
    }

    // 这里使用了旧风格的空指针常量 0，应该使用 nullptr
    int *ptr = nullptr;

    return 0;
}
