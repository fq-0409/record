#include <functional>
class a
{
    std::function<void()> f;

public:
    a();
    void registe(std::function<void()> f);
    void call();
};