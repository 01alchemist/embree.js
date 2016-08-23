// ======================================================================== //
// Copyright 2009-2016 Intel Corporation                                    //
//                                                                          //
// Licensed under the Apache License, Version 2.0 (the "License");          //
// you may not use this file except in compliance with the License.         //
// You may obtain a copy of the License at                                  //
//                                                                          //
//     http://www.apache.org/licenses/LICENSE-2.0                           //
//                                                                          //
// Unless required by applicable law or agreed to in writing, software      //
// distributed under the License is distributed on an "AS IS" BASIS,        //
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. //
// See the License for the specific language governing permissions and      //
// limitations under the License.                                           //
// ======================================================================== //

#pragma once

#include "platform.h"
#include "intrinsics.h"
#include "atomic.h"

namespace embree
{
  /*! system mutex */
  class MutexSys {
    friend struct ConditionImplementation;
  public:
    MutexSys( void );
    ~MutexSys( void );

    void lock( void );
    bool try_lock( void );
    void unlock( void );

  protected:
    void* mutex;
  };

  /*! spinning mutex */
  class AtomicMutex
  {
  public:
 
    AtomicMutex ()
      : flag(false) {}

    __forceinline bool isLocked() {
      return flag.load();
    }

    __forceinline void lock()
    {
      itt_sync_prepare((void*)&flag);
      while (true) 
      {
        while (flag.load()) 
        {
          _mm_pause(); 
          _mm_pause();
        }
        
        bool expected = false;
        if (flag.compare_exchange_strong(expected,true,std::memory_order_acquire))
          break;
      }
      itt_sync_acquired((void*)&flag);
    }
    
    __forceinline bool try_lock()
    {
      itt_sync_prepare((void*)&flag);
      bool expected = false;
      if (flag.load() != expected) {
        itt_sync_cancel((void*)&flag);
        return false;
      }
      bool success = flag.compare_exchange_strong(expected,true,std::memory_order_acquire);
      if (success) itt_sync_acquired((void*)&flag);
      else         itt_sync_cancel((void*)&flag);
      return success;
    }

    __forceinline void unlock() 
    {
      itt_sync_releasing((void*)&flag);
      flag.store(false,std::memory_order_release);
    }
    
    __forceinline void wait_until_unlocked() 
    {
      while(flag.load())
      {
        _mm_pause(); 
        _mm_pause();
      }
    }

  public:
    atomic<bool> flag;
  };

  /*! safe mutex lock and unlock helper */
  template<typename Mutex> class Lock {
  public:
    Lock (Mutex& mutex) : mutex(mutex) { mutex.lock(); }
    ~Lock() { mutex.unlock(); }
  protected:
    Mutex& mutex;
  };

  /*! safe mutex try_lock and unlock helper */
  template<typename Mutex> class TryLock {
  public:
    TryLock (Mutex& mutex) : mutex(mutex), locked(mutex.try_lock()) {}
    ~TryLock() { if (locked) mutex.unlock(); }
    __forceinline bool isLocked() const { return locked; }
  protected:
    Mutex& mutex;
    bool locked;
  };

  /*! safe mutex try_lock and unlock helper */
  template<typename Mutex> class AutoUnlock {
  public:
    AutoUnlock (Mutex& mutex) : mutex(mutex), locked(false) {}
    ~AutoUnlock() { if (locked) mutex.unlock(); }
    __forceinline void lock() { locked = true; mutex.lock(); }
    __forceinline bool isLocked() const { return locked; }
  protected:
    Mutex& mutex;
    bool locked;
  };
}
