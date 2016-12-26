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

//#pragma once

//#include "../common/default.h"
//#include "../common/scene.h"
//#include "../common/simd/simd.h"

//namespace embree
//{
  export class PrimitiveType {

    name:string;        //!< name of this primitive type
    bytes:uint32;       //!< number of bytes of the triangle data
    blockSize:uint32;   //!< block size

    /*! constructs the primitive type */
    constructor(name:string, bytes:uint32, blockSize:uint32):void {
        this.name = name;
        this.bytes = bytes;
        this.blockSize = blockSize;
    }

    /*! Returns the number of stored primitives in a block. */
    @virtual
    size() {
        return 0;
    }

  export class RayPrecalculations {

        ray:Ray;
        ptr:int32;
        numTimeSteps:int32;

      //__forceinline
        constructor(ray:Ray, ptr:int32, numTimeSteps:int32) {
            this.ray = ray;
            this.ptr = ptr;
            this.numTimeSteps = numTimeSteps;
      }
      //__forceinline
     get itime():int32{
         return 0;
     }
     //__forceinline
    get ftime():float32 {
        return 0.0;
    }
      //__forceinline
     get numTimeSteps():uint32 { return 1; }
  }

  export class RayPrecalculationsMB {

      ray: Ray;
      ptr: int32;
      numTimeSteps: int32;
      itime: int32;
      ftime: float32;

      itime_: int32;
      ftime_: float32;
      numTimeSteps_: int32;

      //__forceinline
      constructor(ray: Ray, ptr: int32, numTimeSteps: int32) {
          this.ray = ray;
          this.ptr = ptr;
          this.ftime_ = 0;
          this.itime_ = getTimeSegment(ray.time, float(int(numTimeSteps - 1)), this.ftime_);
          this.ftime = 0.0;
          this.numTimeSteps_ = numTimeSteps;
      }
  }

  //template<int K>
  class RayKPrecalculations
  {

      constructor(valid:vbool<K>, ray:RayK<K>, numTimeSteps:int32){

      }

  public:
    __forceinline RayKPrecalculations() {}
    __forceinline RayKPrecalculations(const vbool<K>& valid, const RayK<K>& ray, unsigned numTimeSteps) {}

    __forceinline vint<K> itime() const { return zero; }
    __forceinline vfloat<K> ftime() const { return zero; }

    __forceinline int itime(size_t k) const { return 0; }
    __forceinline float ftime(size_t k) const { return 0.0f; }

    __forceinline unsigned numTimeSteps() const { return 1; }
  };

  template<int K>
  class RayKPrecalculationsMB
  {
  public:
    __forceinline RayKPrecalculationsMB() {}
    __forceinline RayKPrecalculationsMB(const vbool<K>& valid, const RayK<K>& ray, unsigned numTimeSteps)
    {
      itime_ = getTimeSegment(ray.time, vfloat<K>(float(int(numTimeSteps-1))), ftime_);
      numTimeSteps_ = numTimeSteps;
    }

    __forceinline vint<K> itime() const { return itime_; }
    __forceinline vfloat<K> ftime() const { return ftime_; }

    __forceinline int itime(size_t k) const { return itime_[k]; }
    __forceinline float ftime(size_t k) const { return ftime_[k]; }

    __forceinline unsigned numTimeSteps() const { return numTimeSteps_; }

  private:
    /* used for msmblur implementation */
    vint<K> itime_;
    vfloat<K> ftime_;
    unsigned numTimeSteps_;
  };

  template<typename Precalculations>
  struct Intersector1Precalculations : public RayPrecalculations, public Precalculations
  {
    __forceinline Intersector1Precalculations() {}

    __forceinline Intersector1Precalculations(const Ray& ray, const void* ptr, unsigned numTimeSteps)
      : RayPrecalculations(ray, ptr, numTimeSteps), Precalculations(ray, ptr) {}
  };

  template<typename Precalculations>
  struct Intersector1PrecalculationsMB : public RayPrecalculationsMB, public Precalculations
  {
    __forceinline Intersector1PrecalculationsMB() {}

    __forceinline Intersector1PrecalculationsMB(const Ray& ray, const void* ptr, unsigned numTimeSteps)
      : RayPrecalculationsMB(ray, ptr, numTimeSteps), Precalculations(ray, ptr) {}
  };

  template<int K, typename Precalculations>
  struct IntersectorKPrecalculations : public RayKPrecalculations<K>, public Precalculations
  {
    __forceinline IntersectorKPrecalculations() {}

    __forceinline IntersectorKPrecalculations(const vbool<K>& valid, const RayK<K>& ray, unsigned numTimeSteps)
      : RayKPrecalculations<K>(valid, ray, numTimeSteps), Precalculations(valid, ray) {}
  };

  template<int K, typename Precalculations>
  struct IntersectorKPrecalculationsMB : public RayKPrecalculationsMB<K>, public Precalculations
  {
    __forceinline IntersectorKPrecalculationsMB() {}

    __forceinline IntersectorKPrecalculationsMB(const vbool<K>& valid, const RayK<K>& ray, unsigned numTimeSteps)
      : RayKPrecalculationsMB<K>(valid, ray, numTimeSteps), Precalculations(valid, ray) {}
  };
}
