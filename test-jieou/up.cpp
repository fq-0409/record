#include "low.h"
#include <iostream>
int main()
{
    a a;
    a.registe([]()
              { std::cout << "Hello, World!" << std::endl; });
    a.call();

    return 0;
}