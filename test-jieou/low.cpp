#include "low.h"

a::a() {}
void a::registe(std::function<void()> f)
{
    this->f = f;
}
void a::call()
{
    f();
}