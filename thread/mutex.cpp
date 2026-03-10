// #include <mutex>
// #include <iostream>
// #include <thread>
#include <iostream>
#include "tiny_std_thread.h"
using namespace std;
int main()
{
    int counter = 0;
    std::thread t1([counter]()
                   {
        std::mutex mtx;
        mtx.lock();
        std::cout << "Thread 1: Locked the mutex." << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(2));
        std::cout << "Thread 1: Counter value is " << counter << std::endl;
        mtx.unlock();
        std::cout << "Thread 1: Unlocked the mutex." << std::endl; });

    std::thread t2([counter]()
                   {
        std::mutex mtx;
        mtx.lock();
        std::cout << "Thread 2: Locked the mutex." << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(2));
        std::cout << "Thread 2: Counter value is " << counter << std::endl;
        mtx.unlock();
        std::cout << "Thread 2: Unlocked the mutex." << std::endl; });

    t1.join();
    t2.join();

    return 0;
}