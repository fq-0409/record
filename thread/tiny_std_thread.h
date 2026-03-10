#ifndef TINY_STD_THREAD_H
#define TINY_STD_THREAD_H

#include <windows.h>
#include <process.h>
#include <chrono>
#include <functional>
#include <memory>
#include <system_error>

namespace std
{

    class mutex
    {
        HANDLE m_mutex;

    public:
        mutex()
        {
            m_mutex = CreateMutex(NULL, FALSE, NULL);
        }
        ~mutex()
        {
            CloseHandle(m_mutex);
        }
        void lock()
        {
            WaitForSingleObject(m_mutex, INFINITE);
        }
        void unlock()
        {
            ReleaseMutex(m_mutex);
        }
        // Delete copy constructors
        mutex(const mutex &) = delete;
        mutex &operator=(const mutex &) = delete;
    };

    class thread
    {
        HANDLE m_handle;
        unsigned int m_id;

    public:
        thread() : m_handle(NULL), m_id(0) {}

        template <class Function, class... Args>
        explicit thread(Function &&f, Args &&...args)
        {
            // Simple implementation for no arguments or just capturing lambda
            // For full std::thread support we need tuple and invoke, but here we can cheat a bit for the specific use case
            // The user's code passes a lambda with no arguments.

            auto func = new std::function<void()>(std::bind(std::forward<Function>(f), std::forward<Args>(args)...));

            m_handle = (HANDLE)_beginthreadex(NULL, 0, [](void *arg) -> unsigned
                                              {
            auto func = static_cast<std::function<void()>*>(arg);
            (*func)();
            delete func;
            return 0; }, func, 0, &m_id);
        }

        ~thread()
        {
            if (joinable())
            {
                std::terminate();
            }
        }

        bool joinable() const
        {
            return m_handle != NULL;
        }

        void join()
        {
            if (joinable())
            {
                WaitForSingleObject(m_handle, INFINITE);
                CloseHandle(m_handle);
                m_handle = NULL;
                m_id = 0;
            }
        }

        thread(thread &&other) : m_handle(other.m_handle), m_id(other.m_id)
        {
            other.m_handle = NULL;
            other.m_id = 0;
        }

        thread &operator=(thread &&other)
        {
            if (joinable())
                std::terminate();
            m_handle = other.m_handle;
            m_id = other.m_id;
            other.m_handle = NULL;
            other.m_id = 0;
            return *this;
        }

        // Delete copy
        thread(const thread &) = delete;
        thread &operator=(const thread &) = delete;
    };

    namespace this_thread
    {
        template <class Rep, class Period>
        void sleep_for(const std::chrono::duration<Rep, Period> &sleep_duration)
        {
            auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(sleep_duration).count();
            Sleep((DWORD)ms);
        }
    }

}

#endif // TINY_STD_THREAD_H
